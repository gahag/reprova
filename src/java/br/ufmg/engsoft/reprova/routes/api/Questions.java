package br.ufmg.engsoft.reprova.routes.api;

import spark.Spark;
import spark.Request;
import spark.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.database.QuestionsDAO;
import br.ufmg.engsoft.reprova.model.Question;
import br.ufmg.engsoft.reprova.mime.json.Json;


public class Questions {
  protected static final Logger logger = LoggerFactory.getLogger(Questions.class);

  protected static final String token =
    "d2fad245dd1d8a4f863e3f1c32bdada723361e6f63cfddf56663e516e47347bb";

  protected static final String unauthorised = "\"Unauthorised\"";
  protected static final String invalid = "\"Invalid request\"";
  protected static final String ok = "\"Ok\"";


  protected final Json json;
  protected final QuestionsDAO questionsDAO;




  public Questions(Json json, QuestionsDAO questionsDAO) {
    if (json == null)
      throw new IllegalArgumentException("json mustn't be null");

    if (questionsDAO == null)
      throw new IllegalArgumentException("questionsDAO mustn't be null");

    this.json = json;
    this.questionsDAO = questionsDAO;
  }



  public static boolean authorized(String token) {
    return Questions.token.equals(token);
  }

  public void setup() {
    Spark.get("/api/questions", this::get);
    Spark.post("/api/questions", this::post);
    Spark.delete("/api/questions", this::delete);

    logger.info("Setup /api/questions.");
  }


  protected Object get(Request request, Response response) {
    logger.info("Received questions get:");

    response.type("application/json");

    var id = request.queryParams("id");
    var token = request.queryParams("token");

    if (id != null) {
      logger.info("Fetching question " + id);

      var question = questionsDAO.get(id);

      if (question == null) {
        logger.error("Invalid request!");

        response.status(400);

        return invalid;
      }

      if (question.pvt && !authorized(token)) {
        logger.info("Unauthorized token: " + token);

        response.status(403);

        return unauthorised;
      }

      logger.info("Done. Responding...");

      response.status(200);

      return json.render(question);
    }
    else {
      logger.info("Fetching questions.");

      var questions = questionsDAO.list(
        null,
        null,
        authorized(token)
      );

      logger.info("Done. Responding...");

      response.status(200);

      return json.render(questions);
    }
  }


  protected Object post(Request request, Response response) {
    String body = request.body();

    logger.info("Received questions post:" + body);

    response.type("application/json");

    var token = request.queryParams("token");

    if (!authorized(token)) {
      logger.info("Unauthorized token: " + token);

      response.status(403);

      return unauthorised;
    }

    Question question;
    try {
      question = json
        .parse(body, Question.Builder.class)
        .build();
    }
    catch (Exception e) {
      logger.error("Invalid request payload!", e);

      response.status(400);

      return invalid;
    }

    logger.info("Parsed " + question.toString());

    logger.info("Adding question.");

    if (questionsDAO.add(question))
      response.status(200);
    else
      response.status(400);

    logger.info("Done. Responding...");

    return ok;
  }


  protected Object delete(Request request, Response response) {
    logger.info("Received questions delete:");

    response.type("application/json");

    var id = request.queryParams("id");
    var token = request.queryParams("token");

    if (!authorized(token)) {
      logger.info("Unauthorized token: " + token);

      response.status(403);

      return unauthorised;
    }

    if (id == null) {
      logger.error("Invalid request!");
      response.status(400);
      return invalid;
    }

    logger.info("Deleting question " + id);

    var result = questionsDAO.remove(id);

    logger.info("Done. Responding...");

    response.status(result ? 200 : 400);

    return ok;
  }
}

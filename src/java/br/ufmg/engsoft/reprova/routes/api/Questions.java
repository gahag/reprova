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
  protected static Logger logger = LoggerFactory.getLogger(Questions.class);


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




  public void setup() {
    Spark.get("/api/questions", this::get);
    Spark.post("/api/questions", this::post);
    Spark.delete("/api/questions", this::delete);

    logger.info("Setup /api/questions.");
  }


  protected String get(Request request, Response response) {
    logger.info("Received questions get:");

    response.type("application/json");

    var id = request.queryParams("id");

    if (id != null) {
      logger.info("Fetching question " + id);

      var question = questionsDAO.get(id);

      logger.info("Done. Responding...");

      return json.render(question);
    }
    else {
      logger.info("Fetching questions.");

      var questions = questionsDAO.list(null, null, null);

      logger.info("Done. Responding...");

      return json.render(questions);
    }
  }


  protected String post(Request request, Response response) {
    String body = request.body();

    logger.info("Received questions post:" + body);

    response.type("application/json");


    Question question;
    try {
      question = json
        .parse(body, Question.Builder.class)
        .build();
    }
    catch (Exception e) {
      // TODO
      logger.error("Invalid request payload!", e);
      return null;
    }

    logger.info("Parsed " + question.toString());


    questionsDAO.add(question);

    return "OK";
  }


    protected String delete(Request request, Response response) {
      logger.info("Received questions delete:");

      response.type("application/json");

      var id = request.queryParams("id");

      logger.info("Deleting question " + id);

      var result = questionsDAO.remove(id);

      logger.info("Done. Responding...");

      return result ? "OK" : "Error";

    }
}


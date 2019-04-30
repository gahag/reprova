package br.ufmg.engsoft.reprova.routes.api;

import spark.Spark;
import spark.Request;
import spark.Response;

import com.google.gson.Gson;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.database.QuestionsDAO;
import br.ufmg.engsoft.reprova.model.Question;


public class Questions {
  protected static Logger logger = LoggerFactory.getLogger(Questions.class);


  protected final Gson jsonParser;
  protected final QuestionsDAO questionsDAO;




  public Questions(Gson jsonParser, QuestionsDAO questionsDAO) {
    if (jsonParser == null)
      throw new IllegalArgumentException("jsonParser mustn't be null");

    if (questionsDAO == null)
      throw new IllegalArgumentException("questionsDAO mustn't be null");

    this.jsonParser = jsonParser;
    this.questionsDAO = questionsDAO;
  }




  public void setup() {
    Spark.post("/api/questions", this::post);
    logger.info("Post on /api/questions.");
  }


  protected String post(Request request, Response response) {
    logger.info("Received questions post:");

    String body = request.body();

    logger.info(body);


    response.type("application/json");


    Question question;
    try {
      question = jsonParser
        .fromJson(body, Question.Builder.class)
        .build();
    }
    catch (Exception e) {
      // TODO
      System.out.println(e);
      return null;
    }

    logger.info("Parsed question:");
    logger.info(question.toString());


    questionsDAO.add(question);

    return "OK";
  }
}


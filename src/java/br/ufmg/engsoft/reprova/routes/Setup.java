package br.ufmg.engsoft.reprova.routes;

import spark.Spark;

import com.google.gson.Gson;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.database.QuestionsDAO;
import br.ufmg.engsoft.reprova.routes.api.Questions;


public class Setup {
  protected Setup() { }


  protected static final int port = 1337;

  protected static Logger logger = LoggerFactory.getLogger(Setup.class);


  public static void routes(Gson jsonParser, QuestionsDAO questionsDAO) {
    if (jsonParser == null)
      throw new IllegalArgumentException("jsonParser mustn't be null");

    if (questionsDAO == null)
      throw new IllegalArgumentException("questionsDAO mustn't be null");


    Spark.port(Setup.port);

    logger.info("Spark on port " + Setup.port);

    logger.info("Setting up questions route:");
    var questions = new Questions(jsonParser, questionsDAO);
    questions.setup();
  }
}

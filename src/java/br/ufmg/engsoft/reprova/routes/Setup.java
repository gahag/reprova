package br.ufmg.engsoft.reprova.routes;

import spark.Spark;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.database.QuestionsDAO;
import br.ufmg.engsoft.reprova.routes.api.Questions;
import br.ufmg.engsoft.reprova.mime.json.Json;


public class Setup {
  protected Setup() { }


  protected static final int port = 8080;

  protected static Logger logger = LoggerFactory.getLogger(Setup.class);


  public static void routes(Json json, QuestionsDAO questionsDAO) {
    if (json == null)
      throw new IllegalArgumentException("json mustn't be null");

    if (questionsDAO == null)
      throw new IllegalArgumentException("questionsDAO mustn't be null");


    Spark.port(Setup.port);

    logger.info("Spark on port " + Setup.port);

    logger.info("Setting up static resources.");
    Spark.staticFiles.location("/public");

    logger.info("Setting up questions route:");
    var questions = new Questions(json, questionsDAO);
    questions.setup();
  }
}

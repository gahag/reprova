package br.ufmg.engsoft.reprova;

import br.ufmg.engsoft.reprova.database.Mongo;
import br.ufmg.engsoft.reprova.database.QuestionsDAO;
import br.ufmg.engsoft.reprova.routes.Setup;


public class Reprova {
  public static void main(String[] args) {
    var db = new Mongo("reprova");

    var questionsDAO = new QuestionsDAO(db);

    var jsonParser = br.ufmg.engsoft.reprova.mime.json.Parser.create();


    Setup.routes(jsonParser, questionsDAO);
  }
}

package br.ufmg.engsoft.reprova.mime.json;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import br.ufmg.engsoft.reprova.model.Semester;


public class Parser {
  protected Parser() { }


  public static Gson create() {
    var parserBuilder = new GsonBuilder();

    parserBuilder.registerTypeAdapter(Semester.class, new Semester.Deserializer());

    return parserBuilder.create();
  }
}

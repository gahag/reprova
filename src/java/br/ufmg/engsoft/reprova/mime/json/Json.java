package br.ufmg.engsoft.reprova.mime.json;

import java.lang.reflect.Type;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;

import br.ufmg.engsoft.reprova.model.Question;
import br.ufmg.engsoft.reprova.model.Semester;


public class Json {
  protected static class SemesterDeserializer implements JsonDeserializer<Semester> {
    @Override
    public Semester deserialize(
      JsonElement json,
      Type typeOfT,
      JsonDeserializationContext context
    ) {
      String[] values = json.getAsString().split("/");

      if (values.length != 2)
        throw new JsonParseException("invalid semester");

      var year = Integer.parseInt(values[0]);

      var ref = Semester.Reference.fromInt(Integer.parseInt(values[1]));

      return new Semester(year, ref);
    }
  }


  protected static class QuestionBuilderDeserializer
    implements JsonDeserializer<Question.Builder>
  {
    @Override
    public Question.Builder deserialize(
      JsonElement json,
      Type typeOfT,
      JsonDeserializationContext context
    ) {
      var parserBuilder = new GsonBuilder();

      parserBuilder.registerTypeAdapter(Semester.class, new SemesterDeserializer());

      var questionBuilder = parserBuilder
        .create()
        .fromJson(
          json.getAsJsonObject(),
          Question.Builder.class
      );

      var _id = json.getAsJsonObject().get("_id");

      if (_id != null)
        questionBuilder.id(
          _id.getAsJsonObject()
            .get("$oid")
            .getAsString()
        );

      return questionBuilder;
    }
  }



  protected Gson gson;



  public Json() {
    var parserBuilder = new GsonBuilder();

    parserBuilder.registerTypeAdapter(
      Question.Builder.class,
      new QuestionBuilderDeserializer()
    );

    this.gson = parserBuilder.create();
  }



  public <T> T parse(String json, Class<T> cls) {
    return this.gson.fromJson(json, cls);
  }

  public <T> String render(T obj) {
    return this.gson.toJson(obj);
  }
}

package br.ufmg.engsoft.reprova.model;

import java.util.Map;
import java.util.HashMap;
import java.lang.reflect.Type;

import com.google.gson.JsonElement;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonParseException;


public class Semester {
  public enum Reference {
    _1(1),
    _2(2);

    public final int value;
    Reference(int i) {
      this.value = i;
    }

    protected static final Map<Integer, Reference> valueMap = new HashMap<Integer, Reference>();
    static {
      for (var ref : Reference.values())
        valueMap.put(ref.value, ref);
    }

    public static Reference fromInt(int i) {
      Reference ref = valueMap.get(Integer.valueOf(i));

      if (ref == null)
        throw new IllegalArgumentException();

      return ref;
    }
  }


  public final int year;
  public final Reference ref;



  public static class Deserializer implements JsonDeserializer<Semester> {
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

      var ref = Reference.fromInt(Integer.parseInt(values[1]));

      return new Semester(year, ref);
    }
  }

  public Semester(int year, Reference ref) {
    if (ref == null)
      throw new IllegalArgumentException("ref mustn't be null");

    this.year = year;
    this.ref = ref;
  }



  public String toString() {
    return String.format(
      "%d/%d",
      this.year,
      this.ref.value);
  }
}

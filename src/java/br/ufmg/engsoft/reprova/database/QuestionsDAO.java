package br.ufmg.engsoft.reprova.database;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.mongodb.client.MongoCollection;
import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Projections.*;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.mime.json.Json;
import br.ufmg.engsoft.reprova.model.Question;
import br.ufmg.engsoft.reprova.model.Semester;


public class QuestionsDAO {
  protected final Json json;

  protected final MongoCollection<Document> collection;

  protected static Logger logger = LoggerFactory.getLogger(QuestionsDAO.class);



  public QuestionsDAO(Mongo db, Json json) {
    if (json == null)
      throw new IllegalArgumentException("json mustn't be null");

    this.json = json;

    this.collection = db.getCollection("questions");
  }



  protected Question parseDoc(Document document) {
    var doc = document.toJson();
    logger.info("Fetched question: " + doc);
    try {
      var question = json
        .parse(doc, Question.Builder.class)
        .build();

      logger.info("Parsed question: " + question);

      return question;
    }
    catch (Exception e) {
      logger.error("Invalid document in database!", e);
      return null; // TODO
    }
  }


  public Question get(String id) {
    var question = this.collection
      .find(eq(new ObjectId(id)))
      .map(this::parseDoc)
      .first();

    if (question == null)
      logger.info("No such question " + id);

    return question;
  }


  public List<Question> list(String theme, Set<Semester> semester, Boolean pvt) {
    var filters = Arrays.asList(
        theme == null ? null : eq("theme", theme),
        pvt == null ? null : eq("pvt", pvt)
        // Semester
      )
      .stream()
      .filter(Objects::nonNull)
      .collect(Collectors.toList());

    var doc = filters.isEmpty() // mongo won't take null as a filter.
      ? this.collection.find()
      : this.collection.find(and(filters));

    var result = new ArrayList<Question>();

    doc.projection(fields(exclude("statement")))
      .map(this::parseDoc)
      .into(result);

    return result;
  }


  public boolean add(Question question) {
    Map<String, Object> record = question.record // Convert the keys to string,
      .entrySet()                                // and values to object.
      .stream()
      .collect(
        Collectors.toMap(
          e -> e.getKey().toString(),
          Map.Entry::getValue
        )
      );

    Document doc = new Document()
      .append("theme", question.theme)
      .append("description", question.description)
      .append("statement", question.statement)
      .append("record", new Document(record))
      .append("pvt", question.pvt);

    var id = question.id;
    if (id != null) {
      var result = this.collection.replaceOne(
        eq(new ObjectId(id)),
        doc
      );

      if (!result.wasAcknowledged()) {
        logger.warn("Failed to replace question " + id);
        return false;
      }
    }
    else
      this.collection.insertOne(doc);

    logger.info("Stored question " + doc.get("_id"));

    return true;
  }

  public boolean remove(String id) {
    var result = this.collection.deleteOne(
      eq(new ObjectId(id))
    ).wasAcknowledged();

    if (result)
      logger.info("Deleted question " + id);
    else
      logger.warn("Failed to delete question " + id);

    return result;
  }
}

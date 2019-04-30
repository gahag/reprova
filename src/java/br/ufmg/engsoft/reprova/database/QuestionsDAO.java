package br.ufmg.engsoft.reprova.database;

import java.util.Map;
import java.util.stream.Collectors;

import com.mongodb.client.MongoCollection;

import org.bson.Document;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.ufmg.engsoft.reprova.model.Question;


public class QuestionsDAO {
  protected final MongoCollection<Document> collection;

  protected static Logger logger = LoggerFactory.getLogger(QuestionsDAO.class);



  public QuestionsDAO(Mongo db) {
    this.collection = db.getCollection("questions");
  }



  public void add(Question question) {
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

    if (question.id != null)
      doc.append("_id", question.id);

    this.collection.insertOne(doc);

    logger.info("Stored question #" + doc.get("_id"));
  }
}

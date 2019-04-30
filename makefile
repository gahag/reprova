build:
	mvn compile

package:
	mvn assembly:single

run:
	java -jar target/reprova.jar

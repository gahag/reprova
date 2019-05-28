build:
	mvn compile

package:
	mvn assembly:single

docker:
	docker-compose build

run:
	docker-compose up

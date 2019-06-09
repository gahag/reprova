build:
	mvn compile

package:
	mvn assembly:single

test:
	mvn test

docker-build:
	docker-compose build

docker-pull:
	docker-compose pull reprova

docker-run:
	docker-compose up

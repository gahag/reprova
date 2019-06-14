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

heroku-deploy:
	docker tag gahag/reprova:v0.1 registry.heroku.com/reprova-engsoft/web
	docker push registry.heroku.com/reprova-engsoft/web
	heroku container:release web -a reprova-engsoft

heroku-ps:
	heroku ps -a reprova-engsoft

heroku-logs:
	heroku logs -a reprova-engsoft

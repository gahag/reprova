from openjdk:13-alpine

run mkdir -p /root/reprova/

workdir /root/reprova/

add target/reprova.jar reprova.jar

expose 8080

cmd java -jar reprova.jar

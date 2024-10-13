FROM openjdk:17-jdk-slim

WORKDIR /app

COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./

RUN chmod +x mvnw

COPY src ./src

RUN ./mvnw clean package

CMD ["java", "-jar", "target/campuseats-0.0.1-SNAPSHOT.jar"]
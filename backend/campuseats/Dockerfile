# Use OpenJDK as base image
FROM maven:3.9.6-openjdk-21-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and src directory to the container
COPY pom.xml .
COPY src ./src

# Download dependencies (this layer is cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Package the application (skip tests to speed up build)
RUN mvn clean package -DskipTests

# Use OpenJDK as the runtime image
FROM openjdk:21-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the packaged JAR file from the build stage
COPY --from=build /app/target/campuseats-0.0.1-SNAPSHOT.jar ./app.jar

# Expose the port the app runs on
EXPOSE 8080

# Command to run the JAR file
CMD ["java", "-jar", "app.jar"]

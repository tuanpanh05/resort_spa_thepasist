# Stage 1: Build the application using Maven and JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the JAR
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Create a lightweight runtime image using eclipse-temurin JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Set timezone to Asia/Ho_Chi_Minh (optional but useful for Vietnamese booking systems)
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Expose the default Spring Boot port
EXPOSE 8080

# Copy the compiled JAR from the build stage
COPY --from=build /app/target/smms-0.0.1-SNAPSHOT.jar app.jar

# Run the spring-boot application
ENTRYPOINT ["java", "-Duser.timezone=Asia/Ho_Chi_Minh", "-jar", "app.jar"]

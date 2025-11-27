# ---------------------------
# Build Stage
# ---------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven descriptor first for caching
COPY pom.xml .

# Pre-download dependencies
RUN mvn -q -DskipTests dependency:go-offline

# Copy source
COPY src ./src

# Build the JAR
RUN mvn -q -DskipTests clean package

# ---------------------------
# Run Stage
# ---------------------------
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built jar from Maven build stage
COPY --from=build /app/target/*.jar app.jar

# Render sets PORT dynamically, don't hardcode 8000
ENV PORT=8080

# Tell Spring Boot to use Render's port
ENV JAVA_OPTS="-Dserver.port=${PORT}"

EXPOSE 8080

# Start the Spring Boot JAR
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

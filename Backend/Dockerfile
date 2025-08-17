# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# 1) Cache dependencies
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

# 2) Build
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root
RUN useradd -r -u 1001 appuser
USER appuser

# Copy the jar explicitly (avoid wildcards)
ARG JAR=/app/target/app.jar
COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

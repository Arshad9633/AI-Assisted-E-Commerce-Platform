FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY commerce-api/commerce-api/pom.xml ./pom.xml
RUN mvn -B -q -DskipTests dependency:go-offline

COPY commerce-api/commerce-api/src ./src
RUN mvn -B -q clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8000
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

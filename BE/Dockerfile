# Stage 1: Build
FROM maven:3.9.8-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run
FROM amazoncorretto:21.0.4
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục log và cấp quyền
RUN mkdir -p /var/log/scms \
    && chown 1000:1000 /var/log/scms

# Copy .env nếu dùng dotenv-java
COPY .env .env

VOLUME /var/log/scms
ENTRYPOINT ["java", "-jar", "app.jar"]

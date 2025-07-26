# PersonDataHub_Redis
Developed a Spring Boot application to manage Person entities, utilizing MySQL for persistent storage and Redis for enhanced in-memory data access
This documentation provides an in-depth overview of the RedisCRUD application, detailing its structure, configuration, and the main components involved in managing Person entities using both MySQL and Redis. By following this guide, you should be able to understand the project's setup and functionality, and how the different components interact to provide CRUD operations for Person entities.


# Introduction
The RedisCRUD application is a Spring Boot project designed to manage Person entities with CRUD operations using both MySQL and Redis for storage. The project leverages Redis for fast in-memory data access, while also ensuring persistence in a relational database.

# Project Structure
The project is structured as follows:

com.example.RedisCRUD
config: Contains configuration classes for Redis.
controller: Contains REST controllers for handling HTTP requests.
dto: Contains Data Transfer Objects (DTOs) for handling data transfer between layers.
model: Contains entity classes representing the data model.
repo: Contains repository interfaces for data access.
service: Contains service classes for business logic.
RedisCrudApplication: The main application class.

# Configuration
File: RedisConfig.java
file contains the configuration for connecting to a Redis instance using the LettuceConnectionFactory and setting up a RedisTemplate for interacting with Redis.

# Models and DTOs
File: Person.java
The Person class is an entity representing a person in the system. It uses JPA annotations to map the class to a database table. The @CreationTimestamp and @UpdateTimestamp annotations automatically manage the creation and update timestamps.

Files: CreatePeronRequest.java and UpdateRequest.java
These DTO classes are used to transfer data when creating or updating a Person. They provide a convenient way to pass data from the client to the server and vice versa.

Repositories
File: PersonRepo.java
This repository interface extends JpaRepository to provide CRUD operations for Person entities in the MySQL database. It also includes a custom query method to find a Person by their email.

File: RedisDataRepo.java
This repository interacts with Redis to store and retrieve Person entities. It uses RedisTemplate to perform operations on Redis. It saves a person using multiple keys for faster access.

# Services
File: PersonService.java
The PersonService class contains the business logic for managing Person entities. It uses both PersonRepo and RedisDataRepo to perform operations. When a Person is created or updated, it is saved in both the MySQL database and Redis. For retrieval, it first checks Redis and falls back to the MySQL database if the Person is not found in Redis.

# Controllers
File: CRUDController.java
The CRUDController class handles HTTP requests for creating, retrieving, and updating Person entities. It uses the PersonService to perform the necessary operations and returns the results as HTTP responses.

# Application Entry Point
File: RedisCrudApplication.java
The RedisCrudApplication class is the main entry point of the Spring Boot application. The @SpringBootApplication annotation indicates a configuration class that declares one or more @Bean methods and also triggers auto-configuration and component scanning.

## PersonDataHub_Redis

A Spring Boot CRUD application using Redis as the primary database to manage information about people. Redis is used for its speed and efficiency in storing and retrieving key-value pairs, making the application suitable for real-time operations and caching.

---

##  Project Overview

**PersonDataHub_Redis** is a Java-based backend application that uses **Spring Boot** and **Redis** to perform basic CRUD (Create, Read, Update, Delete) operations on a `Person` entity.

It demonstrates:
- How to integrate Redis with Spring Boot using Spring Data Redis
- Fast, in-memory data management
- Use of layered architecture (Controller → Service → Repository)

---

##  Functional Features

1.  Add a new person  
2.  Retrieve a person by ID  
3.  Retrieve all persons  
4.  Update person’s name or location  
5.  Delete a person using their ID  

---

##  Why Redis?

Redis is a blazing fast, in-memory, NoSQL key-value database. This makes it ideal for:
- Real-time applications
- Caching layers
- Session management
- Rapid read/write operations

This project uses Redis to demonstrate how such a database can efficiently manage structured data.

---

##  System Architecture

Client (Postman / Web / Mobile)
|
v
CRUDController.java (REST APIs)
|
v
PersonService.java (Business Logic)
|
v
PersonRepo.java (Spring Data Redis)
|
v
Redis Database (In-memory NoSQL)

---

##  Technologies Used

| Layer              | Technology         |
|-------------------|--------------------|
| Language           | Java 17            |
| Framework          | Spring Boot        |
| Database           | Redis              |
| Data Access        | Spring Data Redis  |
| Build Tool         | Maven              |
| Utility Libraries  | Lombok, JUnit      |

---

##  Project Structure

RedisData/
├── src/
│ ├── main/
│ │ ├── java/com/example/RedisCRUD/
│ │ │ ├── config/ # Redis configuration
│ │ │ ├── controller/ # API endpoints
│ │ │ ├── dto/ # Data transfer objects
│ │ │ ├── model/ # Person entity
│ │ │ ├── repo/ # Redis repositories
│ │ │ ├── service/ # Business logic
│ │ │ └── RedisApplication.java# Application entry point
│ │ └── resources/
│ │ └── application.properties
│ └── test/
├── pom.xml

---

##  How It Works

### Create Person  
POST `/add`
json
{
  "id": "1",
  "name": "Alice",
  "location": "Mumbai"
}


---

Get Person by ID
GET /get/1

---

Get All Persons
GET /all

---

Update Person
PUT /update

json

{
  "id": "1",
  "name": "Alicia",
  "location": "Delhi"
}

---

Delete Person
DELETE /delete/1



## How to Run the Project

# Prerequisites
-Java 17
-Redis server installed (run redis-server)
-Maven

# Steps
Navigate into project directory:
cd RedisData

# Run Spring Boot app
./mvnw spring-boot:run
Visit: http://localhost:8080 to start testing with Postman or curl.

# Configuration
Edit Redis host/port if necessary in:
src/main/resources/application.properties
spring.redis.host=localhost
spring.redis.port=6379

# Testing
JUnit test included:
src/test/java/com/example/RedisCRUD/RedisCrudApplicationTests.java



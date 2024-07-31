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

package com.example.RedisCRUD;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.Cacheable;

@SpringBootApplication
public class RedisCrudApplication {

	public static void main(String[] args) {
		SpringApplication.run(RedisCrudApplication.class, args);
	}

}

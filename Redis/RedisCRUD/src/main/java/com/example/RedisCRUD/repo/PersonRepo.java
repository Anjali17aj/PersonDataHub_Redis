package com.example.RedisCRUD.repo;

import com.example.RedisCRUD.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepo extends JpaRepository<Person, Integer> {
    Person findByEmail(String email);

}

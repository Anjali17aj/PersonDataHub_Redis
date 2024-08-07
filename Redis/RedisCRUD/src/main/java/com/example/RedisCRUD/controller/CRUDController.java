package com.example.RedisCRUD.controller;

import com.example.RedisCRUD.dto.CreatePeronRequest;
import com.example.RedisCRUD.dto.UpdateRequest;
import com.example.RedisCRUD.model.Person;
import com.example.RedisCRUD.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CRUDController {

    @Autowired
    PersonService personService;

    @PostMapping("/create")
    public ResponseEntity<Person> create(@RequestBody CreatePeronRequest createPeronRequest){
       Person person =  personService.create(createPeronRequest);
        return ResponseEntity.ok(person);
    }

    @GetMapping("/get")
    public ResponseEntity<Person> getByEmail(@RequestParam String email){
        Person person = personService.getByEmail(email);
        return ResponseEntity.ok(person);
    }

    @PutMapping("/update")
    public ResponseEntity<Person> update(@RequestParam String email, @RequestBody UpdateRequest updateRequest){
        Person person =  personService.update(email, updateRequest);
        return ResponseEntity.ok(person);
    }
}

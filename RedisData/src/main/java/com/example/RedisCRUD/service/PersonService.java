package com.example.RedisCRUD.service;

import com.example.RedisCRUD.dto.CreatePeronRequest;
import com.example.RedisCRUD.dto.UpdateRequest;
import com.example.RedisCRUD.model.Person;
import com.example.RedisCRUD.repo.PersonRepo;
import com.example.RedisCRUD.repo.RedisDataRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class PersonService {

    @Autowired
    PersonRepo personRepo;

    @Autowired
    RedisDataRepo redisDataRepo;

    public Person create(CreatePeronRequest createPeronRequest) {
     Person person = personRepo.save(createPeronRequest.toPerson());
     redisDataRepo.savePerson(person);
     return person;
    }

    public Person getByEmail(String email) {
        if(redisDataRepo.getPersonByEmail(email) != null){
            return redisDataRepo.getPersonByEmail(email);
        }
        return personRepo.findByEmail(email);
    }

//   public Person update(String email, UpdateRequest updateRequest) {
//        Person person = personRepo.findByEmail(email);
//        person.setName(updateRequest.getName());
//        person.setEmail(updateRequest.getEmail());
//        person.setAge(updateRequest.getAge());
//        person.setAddress(updateRequest.getAddress());
//        personRepo.save(person);
//        redisDataRepo.savePerson(person);
//        return person;
//    }

    public Person update(String email, UpdateRequest updateRequest) {
        Person person = personRepo.findByEmail(email);
        if (person != null) {
            // Remove old entry from Redis if the email is being updated
            if (!email.equals(updateRequest.getEmail())) {
                redisDataRepo.deletePersonByEmail(email);
            }
            // Update person details
            person.setName(updateRequest.getName());
            person.setEmail(updateRequest.getEmail());
            person.setAge(updateRequest.getAge());
            person.setAddress(updateRequest.getAddress());
            // Save updated person to the repository
            personRepo.save(person);

            // Save updated person to Redis
            redisDataRepo.savePerson(person);
        }
        return person;
    }

}

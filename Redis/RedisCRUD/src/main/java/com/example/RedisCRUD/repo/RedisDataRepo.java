//package com.example.RedisCRUD.repo;
//
//import com.example.RedisCRUD.model.Person;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.stereotype.Repository;
//import org.springframework.web.client.RestTemplate;
//
//@Repository
//public class RedisDataRepo {
//
//    @Autowired
//    private RedisTemplate<String, Object> redisTemplate;
//
//    private final String PERSON_KEY="person";
//
//    public void savePerson(Person person){
//           setPersonToRedisByEmail(person);
//           setPersionToRedisById(person);
//    }
//
//    public void setPersonToRedisByEmail(Person person){
//        redisTemplate.opsForList().leftPush(PERSON_KEY+person.getEmail(), person);
//    }
//
//    public void setPersionToRedisById(Person person){
//        redisTemplate.opsForList().leftPush(PERSON_KEY+person.getId(), person);
//    }
//
//    public Person getPersonByEmail(String email){
//        return (Person) redisTemplate.opsForList().leftPop(PERSON_KEY+email);
//    }
//
//}


package com.example.RedisCRUD.repo;

import com.example.RedisCRUD.model.Person;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RedisDataRepo {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final String PERSON_KEY = "person:";

    public void savePerson(Person person) {
        setPersonToRedisByEmail(person);
        setPersonToRedisById(person);
        setPersonToRedisByage(person);
        setPersonToRedisByname(person);
    }

    public void setPersonToRedisByEmail(Person person) {
        redisTemplate.opsForValue().set(PERSON_KEY + "email:" + person.getEmail(), person);
    }

    public void setPersonToRedisById(Person person) {
        redisTemplate.opsForValue().set(PERSON_KEY + "id:" + person.getId(), person);
    }

    public void setPersonToRedisByage(Person person) {
        redisTemplate.opsForValue().set(PERSON_KEY + "age:" + person.getAge(), person);
    }

    public void setPersonToRedisByname(Person person) {
        redisTemplate.opsForValue().set(PERSON_KEY + "name:" + person.getName(), person);
    }

    public Person getPersonByEmail(String email) {
        return (Person) redisTemplate.opsForValue().get(PERSON_KEY + "email:" + email);
    }

    public Person getPersonById(Long id) {
        return (Person) redisTemplate.opsForValue().get(PERSON_KEY + "id:" + id);
    }

    public void deletePersonByEmail(String email) {
        redisTemplate.delete(PERSON_KEY + "email:" + email);
    }

}


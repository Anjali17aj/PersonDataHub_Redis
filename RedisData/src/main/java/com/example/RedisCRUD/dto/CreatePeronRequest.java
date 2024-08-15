package com.example.RedisCRUD.dto;


import com.example.RedisCRUD.model.Person;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CreatePeronRequest {

    private String name;
    private String email;

    private int age;

    private String address;

    public Person toPerson(){
       return Person.builder()
               .name(this.name)
               .email(this.email)
               .age(this.age)
               .address(this.address)
               .build();
   }
}

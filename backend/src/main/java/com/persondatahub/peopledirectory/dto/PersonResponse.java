package com.persondatahub.peopledirectory.dto;

import com.persondatahub.peopledirectory.model.Person;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonResponse {

    private Integer id;
    private String name;
    private String email;
    private int age;
    private String address;
    private Instant createdOn;
    private Instant updatedOn;
    private boolean fromCache;

    public static PersonResponse from(Person person) {
        return from(person, false);
    }

    public static PersonResponse from(Person person, boolean fromCache) {
        return PersonResponse.builder()
                .id(person.getId())
                .name(person.getName())
                .email(person.getEmail())
                .age(person.getAge())
                .address(person.getAddress())
                .createdOn(person.getCreatedOn())
                .updatedOn(person.getUpdatedOn())
                .fromCache(fromCache)
                .build();
    }
}

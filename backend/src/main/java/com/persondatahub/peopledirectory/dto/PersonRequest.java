package com.persondatahub.peopledirectory.dto;

import com.persondatahub.peopledirectory.model.Person;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PersonRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be zero or greater")
    private Integer age;

    private String address;

    public Person toEntity() {
        return Person.builder()
                .name(name.trim())
                .email(email.trim().toLowerCase())
                .age(age)
                .address(address != null ? address.trim() : null)
                .build();
    }

    public void applyTo(Person person) {
        person.setName(name.trim());
        person.setEmail(email.trim().toLowerCase());
        person.setAge(age);
        person.setAddress(address != null ? address.trim() : null);
    }
}

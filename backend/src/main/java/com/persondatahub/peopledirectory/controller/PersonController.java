package com.persondatahub.peopledirectory.controller;

import com.persondatahub.peopledirectory.dto.PersonPageResponse;
import com.persondatahub.peopledirectory.dto.PersonRequest;
import com.persondatahub.peopledirectory.dto.PersonResponse;
import com.persondatahub.peopledirectory.service.PersonService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/persons")
@Validated
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    @GetMapping
    public PersonPageResponse search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) String address,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        log.debug("GET /api/persons — search page={} size={}", pageable.getPageNumber(), pageable.getPageSize());
        return personService.search(name, email, minAge, maxAge, address, pageable);
    }

    @GetMapping("/by-email")
    public PersonResponse findByEmail(@RequestParam @NotBlank @Email String email) {
        log.debug("GET /api/persons/by-email — email={}", email);
        return personService.findByEmail(email);
    }

    @GetMapping("/{id}")
    public PersonResponse findById(@PathVariable Integer id) {
        log.debug("GET /api/persons/{} — by id", id);
        return personService.findById(id);
    }

    @PostMapping
    public ResponseEntity<PersonResponse> create(@Valid @RequestBody PersonRequest request) {
        log.info("POST /api/persons — create email={}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(personService.create(request));
    }

    @PutMapping("/{id}")
    public PersonResponse update(@PathVariable Integer id, @Valid @RequestBody PersonRequest request) {
        log.info("PUT /api/persons/{} — update email={}", id, request.getEmail());
        return personService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        log.info("DELETE /api/persons/{}", id);
        personService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.persondatahub.peopledirectory.service;

import com.persondatahub.peopledirectory.dto.PersonPageResponse;
import com.persondatahub.peopledirectory.dto.PersonRequest;
import com.persondatahub.peopledirectory.dto.PersonResponse;
import com.persondatahub.peopledirectory.exception.ApiException;
import com.persondatahub.peopledirectory.model.Person;
import com.persondatahub.peopledirectory.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PersonService {

    private static final String CACHE_PREFIX = "person:";
    private static final int MAX_PAGE_SIZE = 100;

    private final PersonRepository personRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.cache.ttl-hours:24}")
    private long cacheTtlHours;

    private Duration cacheTtl() {
        return Duration.ofHours(cacheTtlHours);
    }

    @Transactional
    public PersonResponse create(PersonRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (personRepository.existsByEmail(email)) {
            throw ApiException.conflict("A person with email '" + email + "' already exists");
        }
        Person saved = personRepository.save(request.toEntity());
        cacheSave(saved);
        log.info("Created person id={} email={}", saved.getId(), saved.getEmail());
        return PersonResponse.from(saved);
    }

    public PersonPageResponse search(
            String name,
            String email,
            Integer minAge,
            Integer maxAge,
            String address,
            Pageable pageable) {
        Pageable safePageable = capPageSize(pageable);
        log.debug("Searching persons page={} size={}", safePageable.getPageNumber(), safePageable.getPageSize());
        Page<PersonResponse> page = personRepository
                .search(blankToNull(name), blankToNull(email), minAge, maxAge, blankToNull(address), safePageable)
                .map(PersonResponse::from);
        return PersonPageResponse.from(page);
    }

    public PersonResponse findById(Integer id) {
        Optional<Person> cached = cacheFindById(id);
        if (cached.isPresent()) {
            log.debug("Cache HIT for id={}", id);
            return PersonResponse.from(cached.get(), true);
        }
        log.debug("Cache MISS for id={}, loading from database", id);
        return personRepository.findById(id)
                .map(p -> {
                    cacheSave(p);
                    return PersonResponse.from(p);
                })
                .orElseThrow(() -> ApiException.notFound("Person not found with id: " + id));
    }

    public PersonResponse findByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("Email is required");
        }
        String normalized = normalizeEmail(email);
        Optional<Person> cached = cacheFindByEmail(normalized);
        if (cached.isPresent()) {
            log.debug("Cache HIT for email={}", normalized);
            return PersonResponse.from(cached.get(), true);
        }
        log.debug("Cache MISS for email={}, loading from database", normalized);
        return personRepository.findByEmail(normalized)
                .map(p -> {
                    cacheSave(p);
                    return PersonResponse.from(p);
                })
                .orElseThrow(() -> ApiException.notFound("Person not found with email: " + normalized));
    }

    @Transactional
    public PersonResponse update(Integer id, PersonRequest request) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Person not found with id: " + id));

        String newEmail = normalizeEmail(request.getEmail());
        if (personRepository.existsByEmailAndIdNot(newEmail, id)) {
            throw ApiException.conflict("A person with email '" + newEmail + "' already exists");
        }

        String previousEmail = person.getEmail();
        cacheEvict(person);
        request.applyTo(person);
        Person updated = personRepository.save(person);
        if (!previousEmail.equals(newEmail)) {
            redisTemplate.delete(emailKey(previousEmail));
        }
        cacheSave(updated);
        log.info("Updated person id={} email={}", id, newEmail);
        return PersonResponse.from(updated);
    }

    @Transactional
    public void delete(Integer id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Person not found with id: " + id));
        cacheEvict(person);
        personRepository.delete(person);
        log.info("Deleted person id={} email={}", id, person.getEmail());
    }

    private Pageable capPageSize(Pageable pageable) {
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw ApiException.badRequest("Page size must not exceed " + MAX_PAGE_SIZE);
        }
        if (pageable.getPageSize() < 1) {
            throw ApiException.badRequest("Page size must be at least 1");
        }
        return pageable;
    }

    private void cacheSave(Person person) {
        redisTemplate.opsForValue().set(emailKey(person.getEmail()), person, cacheTtl());
        redisTemplate.opsForValue().set(idKey(person.getId()), person, cacheTtl());
        log.debug("Cached person id={} email={}", person.getId(), person.getEmail());
    }

    private Optional<Person> cacheFindByEmail(String email) {
        return Optional.ofNullable((Person) redisTemplate.opsForValue().get(emailKey(email)));
    }

    private Optional<Person> cacheFindById(Integer id) {
        return Optional.ofNullable((Person) redisTemplate.opsForValue().get(idKey(id)));
    }

    private void cacheEvict(Person person) {
        if (person.getEmail() != null) {
            redisTemplate.delete(emailKey(person.getEmail()));
        }
        if (person.getId() != null) {
            redisTemplate.delete(idKey(person.getId()));
        }
        log.debug("Evicted cache for person id={}", person.getId());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String emailKey(String email) {
        return CACHE_PREFIX + "email:" + email.toLowerCase();
    }

    private String idKey(Integer id) {
        return CACHE_PREFIX + "id:" + id;
    }
}

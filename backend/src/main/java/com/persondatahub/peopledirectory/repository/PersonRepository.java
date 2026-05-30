package com.persondatahub.peopledirectory.repository;

import com.persondatahub.peopledirectory.model.Person;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Integer> {

    Optional<Person> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

    @Query("""
            SELECT p FROM Person p
            WHERE (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:email IS NULL OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%')))
              AND (:minAge IS NULL OR p.age >= :minAge)
              AND (:maxAge IS NULL OR p.age <= :maxAge)
              AND (:address IS NULL OR LOWER(p.address) LIKE LOWER(CONCAT('%', :address, '%')))
            """)
    Page<Person> search(
            @Param("name") String name,
            @Param("email") String email,
            @Param("minAge") Integer minAge,
            @Param("maxAge") Integer maxAge,
            @Param("address") String address,
            Pageable pageable);
}

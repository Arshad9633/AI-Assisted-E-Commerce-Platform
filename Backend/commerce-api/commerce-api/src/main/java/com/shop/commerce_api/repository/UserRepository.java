package com.shop.commerce_api.repository;

import com.shop.commerce_api.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    long countByCreatedAtAfter(Instant since);
    Optional<User> findByEmail(String email);
        boolean existsByEmail(String email);
}

package com.shop.commerce_api.repository;

import com.shop.commerce_api.entity.ERole;
import com.shop.commerce_api.entity.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(ERole name);

}

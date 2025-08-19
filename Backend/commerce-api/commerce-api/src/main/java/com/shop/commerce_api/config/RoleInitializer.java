package com.shop.commerce_api.config;


import com.shop.commerce_api.entity.ERole;
import com.shop.commerce_api.entity.Role;
import com.shop.commerce_api.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class RoleInitializer {

    private final RoleRepository roleRepository;

    public RoleInitializer(RoleRepository roleRepository){
        this.roleRepository = roleRepository;
    }

    @PostConstruct
    public void init(){
        ensureRole(ERole.CUSTOMER);
        ensureRole(ERole.ADMIN);
    }

    private void ensureRole(ERole eRole){
        roleRepository.findByName(eRole).orElseGet(() ->{
            Role role = new Role();
            role.setName(eRole);
            return roleRepository.save(role);
        });
    }
}

package com.example.menuservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<MenuItem, Long> {
    // We get methods like save(), findAll(), findById() for free.
    // We can add custom ones here if needed, like:
    // List<MenuItem> findByCategory(String category);
}
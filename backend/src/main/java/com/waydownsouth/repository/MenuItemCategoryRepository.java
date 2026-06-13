package com.waydownsouth.repository;

import com.waydownsouth.model.MenuItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MenuItemCategoryRepository extends JpaRepository<MenuItemCategory, UUID> {
    Optional<MenuItemCategory> findByName(String name);
}
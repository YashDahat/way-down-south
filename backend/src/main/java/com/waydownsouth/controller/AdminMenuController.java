package com.waydownsouth.controller;

import com.waydownsouth.dto.MenuItemDto;
import com.waydownsouth.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/menu-items")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMenuController {

    private final MenuService menuService;

    public AdminMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping
    public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto createdItem = menuService.createMenuItem(menuItemDto);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDto> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemDto menuItemDto) {
        MenuItemDto updatedItem = menuService.updateMenuItem(id, menuItemDto);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}

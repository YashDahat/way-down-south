package com.waydownsouth.controller;

import com.waydownsouth.dto.MenuItemDto;
import com.waydownsouth.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItemDto>> getMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<MenuItemDto> menuItems = menuService.getAllMenuItems(category, search);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getMenuCategories() {
        List<String> categories = menuService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
}

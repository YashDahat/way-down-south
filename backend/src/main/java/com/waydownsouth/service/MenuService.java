package com.waydownsouth.service;

import com.waydownsouth.dto.MenuItemDto;
import com.waydownsouth.exception.ResourceNotFoundException;
import com.waydownsouth.model.MenuItem;
import com.waydownsouth.model.MenuItemCategory;
import com.waydownsouth.repository.MenuItemCategoryRepository;
import com.waydownsouth.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemCategoryRepository menuItemCategoryRepository;

    public MenuService(MenuItemRepository menuItemRepository, MenuItemCategoryRepository menuItemCategoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.menuItemCategoryRepository = menuItemCategoryRepository;
    }

    private MenuItemDto mapToDto(MenuItem item) {
        MenuItemDto dto = new MenuItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setIsAvailable(item.isAvailable());
        dto.setCategoryName(item.getCategory().getName());
        return dto;
    }

    private void mapDtoToEntity(MenuItemDto dto, MenuItem entity, MenuItemCategory category) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setImageUrl(dto.getImageUrl());
        entity.setAvailable(dto.getIsAvailable());
        entity.setCategory(category);
    }

    public List<MenuItemDto> getAllMenuItems(String category, String searchTerm) {
        List<MenuItem> menuItems;
        if (StringUtils.hasText(category)) {
            menuItems = menuItemRepository.findByCategoryName(category);
        } else if (StringUtils.hasText(searchTerm)) {
            menuItems = menuItemRepository.findByNameContainingIgnoreCase(searchTerm);
        } else {
            menuItems = menuItemRepository.findAll();
        }
        return menuItems.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return menuItemCategoryRepository.findAll().stream()
                .map(MenuItemCategory::getName)
                .collect(Collectors.toList());
    }

    public MenuItemDto createMenuItem(MenuItemDto menuItemDto) {
        Optional<MenuItemCategory> existingCategory = menuItemCategoryRepository.findByName(menuItemDto.getCategoryName());
        MenuItemCategory category = existingCategory.orElseGet(() -> {
            MenuItemCategory newCategory = new MenuItemCategory();
            newCategory.setName(menuItemDto.getCategoryName());
            return menuItemCategoryRepository.save(newCategory);
        });

        MenuItem newItem = new MenuItem();
        mapDtoToEntity(menuItemDto, newItem, category);
        MenuItem savedItem = menuItemRepository.save(newItem);
        return mapToDto(savedItem);
    }

    public MenuItemDto updateMenuItem(UUID id, MenuItemDto menuItemDto) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));

        Optional<MenuItemCategory> existingCategory = menuItemCategoryRepository.findByName(menuItemDto.getCategoryName());
        MenuItemCategory category = existingCategory.orElseGet(() -> {
            MenuItemCategory newCategory = new MenuItemCategory();
            newCategory.setName(menuItemDto.getCategoryName());
            return menuItemCategoryRepository.save(newCategory);
        });

        mapDtoToEntity(menuItemDto, existingItem, category);
        MenuItem updatedItem = menuItemRepository.save(existingItem);
        return mapToDto(updatedItem);
    }

    public void deleteMenuItem(UUID id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
    }
}

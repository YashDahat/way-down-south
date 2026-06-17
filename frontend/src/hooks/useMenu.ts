import { useQuery } from '@tanstack/react-query';
import { getMenuItems, getMenuCategories } from '../services/menuService';
import type { MenuItem } from '../types/menu';

export const useMenu = (params: { category?: string; search?: string }) => {
  const { data, isLoading, error } = useQuery<MenuItem[], Error>({
    queryKey: ['menuItems', params],
    queryFn: () => getMenuItems(params),
  });

  return { data, isLoading, error };
};

export const useMenuCategories = () => {
  const { data, isLoading, error } = useQuery<string[], Error>({
    queryKey: ['menuCategories'],
    queryFn: getMenuCategories,
  });

  return { data, isLoading, error };
};
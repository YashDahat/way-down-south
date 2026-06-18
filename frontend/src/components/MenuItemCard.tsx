import React from 'react';
import { MenuItem } from '../types/menu';

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  return (
    <div className="bg-[#1c1c1e] rounded-lg shadow-lg overflow-hidden">
      <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#f5f0e8] mb-2">{item.name}</h3>
        <p className="text-sm text-[#f5f0e8] mb-4">{item.description}</p>
        <p className="text-lg font-bold text-[#d4a843]">₹{item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default MenuItemCard;
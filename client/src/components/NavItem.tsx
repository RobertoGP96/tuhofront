import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils';

interface NavItemProps {
  label: string;
  icon: LucideIcon;
  to: string;
  variant?: 'top' | 'bottom';
}

export const NavItem: React.FC<NavItemProps> = ({ 
  label, 
  icon: Icon, 
  to,
  variant = 'top' 
}) => {
  const baseClasses = variant === 'bottom'
    ? "flex flex-col items-center justify-center gap-1 p-2 transition-colors"
    : "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all w-full text-left";

  const activeClasses = variant === 'bottom'
    ? "text-secondary-lime"
    : "bg-accent text-primary-navy font-semibold";

  const inactiveClasses = variant === 'bottom'
    ? "text-gray-400 hover:text-primary-navy"
    : "text-gray-600 hover:bg-gray-50 hover:text-primary-navy";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
    >
      <Icon size={variant === 'bottom' ? 24 : 20} className={cn(variant === 'top' && "text-gray-400")} />
      <span className={variant === 'bottom' ? "text-[10px] font-medium" : "text-sm"}>{label}</span>
    </NavLink>
  );
};

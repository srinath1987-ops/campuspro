
import React from 'react';
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

const NavItem = ({ icon: Icon, label, href, active, onClick, className }: NavItemProps) => (
  <a 
    href={href} 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-gray-400 hover:bg-primary/10 hover:text-primary",
      className
    )}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <Icon className="h-5 w-5" />
    <span className="flex-1">{label}</span>
  </a>
);

export default NavItem;

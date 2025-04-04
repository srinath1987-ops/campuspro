
import React, { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from 'lucide-react';

type NavGroupProps = {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const NavGroup = ({ label, children, defaultOpen = true }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-400">
          {label}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NavGroup;

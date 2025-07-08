
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by email, name, or company..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};

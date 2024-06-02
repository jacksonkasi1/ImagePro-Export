import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUtilsStore } from '@/store/useUtilsStore';
import { Label } from './ui/label';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput: React.FC<SearchInputProps> = ({ className, ...props }) => {
  const { searchQuery, setSearchQuery } = useUtilsStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={cn('py-2 flex flex-col gap-1.5', className)} {...props}>
      <Label htmlFor="text">Search image</Label>
      <Input type="text" placeholder="Search Image" value={searchQuery} onChange={handleChange} />
    </div>
  );
};

export default SearchInput;

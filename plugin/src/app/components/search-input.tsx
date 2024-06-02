import React from 'react';

// ** import ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ** import lib
import { cn } from '@/lib/utils';

// ** import store
import { useUtilsStore } from '@/store/useUtilsStore';

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

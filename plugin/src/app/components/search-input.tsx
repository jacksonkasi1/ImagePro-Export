import React, { useState } from 'react';

// ** import ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ** import icons
import { Search } from "lucide-react";

// ** import lib
import { cn } from '@/lib/utils';

// ** import store
import { useUtilsStore } from '@/store/useUtilsStore';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput: React.FC<SearchInputProps> = ({ className, ...props }) => {
    const { searchQuery, setSearchQuery } = useUtilsStore();
    const [inputValue, setInputValue] = useState(searchQuery);

    const handleSearch = () => {
      setSearchQuery(inputValue);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SEARCH_NODES',
            data: inputValue,
          },
        },
        '*'
      );
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ( e.key === 'Enter') {
        handleSearch();
      }
    };
  
    return (
      <div className={cn('py-2 flex flex-col gap-1.5', className)} {...props}>
        <Label htmlFor="text">Search image</Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search image prefix"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="pr-8"
          />
          <Search
            className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={handleSearch}
          />
        </div>
      </div>
    );
  };
  
  export default SearchInput;
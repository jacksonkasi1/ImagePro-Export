import * as React from 'react';

// ** import ui components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';

// ** import types
import { CaseOption } from '@/types/enums';

const CaseSelector = () => {
  const { caseOption, setCaseOption } = useImageExportStore();

  return (
    <Select
      defaultValue={caseOption}
      onValueChange={(value) => {
        console.log(value);
        setCaseOption(value as CaseOption);
      }}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Case</SelectLabel>
          {Object.values(CaseOption).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CaseSelector;

import React from 'react';

// ** import ui components
import { Button } from '@/components/ui/button';

// ** import components
import Sidebar from '@/components/sidebar';
import ScaleBar from '@/components/scale-bar';

// ** import types
import { ExportOption, ExportScaleOption, CaseOption } from '@/types/enums';

// ** import store
import { useImageExportStore } from '@/store/useImageExportStore';
import { useImageNodesStore } from '@/store/useImageNodesStore';

const TestPage: React.FC = () => {
  const {
    exportOption,
    setExportOption,
    exportScaleOption,
    setExportScaleOption,

    caseOption,
    setCaseOption,
  } = useImageExportStore();

  const { allNodesCount, selectedNodesCount } = useImageNodesStore();

  // Example usage
  return (
    <div>
      <h1>Image Export Options</h1>
      <select value={exportOption} onChange={(e) => setExportOption(e.target.value as ExportOption)}>
        {Object.values(ExportOption).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <h2>Scale Options</h2>
      <select value={exportScaleOption} onChange={(e) => setExportScaleOption(e.target.value as ExportScaleOption)}>
        {Object.values(ExportScaleOption).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <h2>Case Options</h2>
      <select value={caseOption} onChange={(e) => setCaseOption(e.target.value as CaseOption)}>
        {Object.values(CaseOption).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <h2>Nodes</h2>
      <p>All Nodes: {allNodesCount}</p>
      <p>Selected Nodes: {selectedNodesCount}</p>

      <Button>Hello</Button>
      <ScaleBar />
      <Sidebar />
    </div>
  );
};

export default TestPage;

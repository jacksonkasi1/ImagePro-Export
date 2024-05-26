import { JSX, h } from "preact";

// ** import store
import { useImageExportStore } from "@/store";

// ** import types
import { ExportOption, ExportScaleOption, CaseOption } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";

const TestView = () => {
  const {
    exportOption,
    setExportOption,
    exportScaleOption,
    setExportScaleOption,
    selectedNodes,
    setSelectedNodes,
    allNodesCount,
    setAllNodesCount,
    selectedNodesCount,
    setSelectedNodesCount,
    caseOption,
    setCaseOption,
  } = useImageExportStore();

  // Example usage
  return (
    <div>
      <h1>Image Export Options</h1>
      <select
        value={exportOption}
        onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
          setExportOption((e.target as HTMLSelectElement).value as ExportOption)
        }
      >
        {Object.values(ExportOption).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <h2>Scale Options</h2>
      <select
        value={exportScaleOption}
        onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
          setExportScaleOption(
            (e.target as HTMLSelectElement).value as ExportScaleOption,
          )
        }
      >
        {Object.values(ExportScaleOption).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <h2>Case Options</h2>
      <select
        value={caseOption}
        onChange={(e: JSX.TargetedEvent<HTMLSelectElement, Event>) =>
          setCaseOption((e.target as HTMLSelectElement).value as CaseOption)
        }
      >
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
      <Sidebar/>
    </div>
  );
};

export default TestView;

import { h, JSX } from "preact";
import { useState } from "preact/hooks";

// ** import ui components
import { Button } from "@/components/ui/button";

// ** import utilities
import { cn } from "@/lib/utils";

// ** import types
import { ExportOption } from "@/types/enums";

// ** import store
import { useImageExportStore } from "@/store";
import { Image } from "lucide-preact";

interface SidebarProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [activeOption, setActiveOption] = useState<ExportOption>(
    ExportOption.JPG,
  );
  const { setExportOption } = useImageExportStore();

  const handleOptionClick = (option: ExportOption) => {
    setActiveOption(option);
    setExportOption(option);
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="py-4 space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 text-lg font-semibold tracking-tight ">
            Export Options
          </h2>
          <div className="space-y-1 max-w-28">
            {Object.values(ExportOption).map((option) => (
              <Button
                isAnimate={false}
                key={option}
                variant={activeOption === option ? "secondary" : "ghost"}
                className="justify-start w-full"
                onClick={() => handleOptionClick(option)}
              >
                <Image className="w-4 h-4 mr-2" /> {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

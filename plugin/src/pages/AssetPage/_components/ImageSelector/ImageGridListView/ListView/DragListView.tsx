import { h } from 'preact';
import { useEffect } from 'preact/hooks';

// ** import third-party lib
import { Flipper, Flipped } from 'react-flip-toolkit';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

// ** import figma ui components
import { Text } from '@create-figma-plugin/ui';

// ** import custom ui components
import { Checkbox } from '@/components/ui/checkbox';

// ** import icons
import DragIcon from '@/assets/Icons/DragIcon';

// ** import types
import { NodeData } from '@/types/node';

// ** import store
import { useImageNodesStore } from '@/store/use-image-nodes-store';

// ** import utils
import { cn, truncateText } from '@/lib/utils';

interface DragListViewProps {
  allNodes: NodeData[];
  base64Images: { [key: string]: string };
  selectedNodeIds: string[];
  onToggleSelection: (id: string, currentChecked: boolean) => void;
}

const DragListView = ({ allNodes, base64Images, selectedNodeIds, onToggleSelection }: DragListViewProps) => {
  const setSelectedNodesOrder = useImageNodesStore((state) => state.setSelectedNodesOrder);
  const selectedNodesOrder = useImageNodesStore((state) => state.selectedNodesOrder || []);

  // Automatically select up to two items whenever allNodes changes
  useEffect(() => {
    if (allNodes.length > 0) {
      const firstNodes = allNodes.slice(0, 2).map((node) => node.id);

      // If there are already two selected nodes, don't auto-select any new ones
      if (selectedNodeIds.length >= 2) {
        return;
      }

      // Find how many new nodes need to be selected to have a total of 2
      const nodesToSelect = firstNodes.filter((id) => !selectedNodeIds.includes(id));
      const remainingToSelect = Math.max(0, 2 - selectedNodeIds.length);

      // If there are nodes that need to be selected
      if (nodesToSelect.length > 0 && remainingToSelect > 0) {
        const updatedSelectedNodes = [...selectedNodeIds, ...nodesToSelect.slice(0, remainingToSelect)];

        setSelectedNodesOrder(updatedSelectedNodes);

        // Update the selection status using the provided toggle function
        nodesToSelect.slice(0, remainingToSelect).forEach((id) => onToggleSelection(id, true));
      }
    }
  }, [allNodes]);

  // Separate selected and unselected nodes
  const selectedNodes = allNodes
    .filter((node) => selectedNodeIds.includes(node.id))
    .sort((a, b) => {
      const indexA = selectedNodesOrder.indexOf(a.id);
      const indexB = selectedNodesOrder.indexOf(b.id);
      return indexA - indexB;
    });

  const unselectedNodes = allNodes.filter((node) => !selectedNodeIds.includes(node.id));

  // Handle item selection toggle and position
  const handleToggleSelection = (id: string, isSelected: boolean) => {
    const newSelected = !isSelected; // Toggle the current state
    onToggleSelection(id, newSelected);

    if (newSelected) {
      // Move to the bottom of selected nodes
      const newSelectedOrder = [...selectedNodesOrder.filter((nodeId) => nodeId !== id), id];
      setSelectedNodesOrder(newSelectedOrder);
    } else {
      // Remove from selected nodes
      const newSelectedOrder = selectedNodesOrder.filter((nodeId) => nodeId !== id);
      setSelectedNodesOrder(newSelectedOrder);
    }
  };

  // Handle drag end
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedNodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the store with the new order
    setSelectedNodesOrder(items.map((item) => item.id));
  };

  return (
    <Flipper flipKey={selectedNodeIds.join(',') + selectedNodesOrder.join(',')}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className={'flex flex-col'}>
          {selectedNodes.length > 0 && (
            <Droppable droppableId="selected-nodes">
              {(provided) => (
                <div className="flex flex-col gap-2" {...provided.droppableProps} ref={provided.innerRef}>
                  {selectedNodes.map((image, index) => {
                    return (
                      <Draggable key={image.id} draggableId={image.id} index={index}>
                        {(provided, snapshot) => (
                          <Flipped flipId={image.id}>
                            <div
                              className={cn(
                                'relative rounded-lg flex items-center cursor-pointer px-2 bg-selected-bg',
                                snapshot.isDragging ? 'shadow-lg' : ''
                              )}
                              ref={provided.innerRef}
                              {...(provided.draggableProps as any)}
                              {...(provided.dragHandleProps as any)}
                              onClick={() => handleToggleSelection(image.id, true)}
                            >
                              <div className="flex items-center w-full gap-2 cursor-pointer">
                                {/* Checkbox */}
                                <Checkbox
                                  value={true}
                                  onValueChange={() => handleToggleSelection(image.id, true)}
                                  className="self-center"
                                />
                                {/* Image Preview */}
                                <div className="flex items-center justify-center w-16 h-16 overflow-hidden cursor-pointer">
                                  {base64Images[image.id] ? (
                                    <img
                                      src={base64Images[image.id]}
                                      alt={`${image.name}`}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                  )}
                                </div>
                                {/* Image Details */}
                                <div className="flex flex-row items-center justify-between w-full gap-2">
                                  <div className="flex flex-col">
                                    <Text className={cn('truncate w-full font-medium')}>
                                      {truncateText(image.name, 17)}
                                    </Text>
                                    <div className="flex flex-row items-center justify-between w-full gap-1">
                                      <Text className="text-secondary-text">{truncateText(image.type, 10)}</Text>
                                      <Text className="text-secondary-text">
                                        {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                                {/* Drag Handle (6 dots menu) */}
                                <div className="ml-auto drag-handle cursor-grab" {...(provided.dragHandleProps as any)}>
                                  <DragIcon />
                                </div>
                              </div>
                            </div>
                          </Flipped>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}

          {/* Conditionally add margin-top when selected nodes are present */}
          {unselectedNodes.length > 0 && (
            <div
              className={cn('flex flex-col gap-2', {
                'mt-2': selectedNodes.length > 0,
              })}
            >
              {unselectedNodes.map((image) => {
                return (
                  <Flipped flipId={image.id} key={image.id}>
                    <div
                      className={cn('relative rounded-lg flex items-center cursor-pointer px-2', 'bg-secondary-bg')}
                      onClick={() => handleToggleSelection(image.id, false)}
                    >
                      <div className="flex items-center w-full gap-2 cursor-pointer">
                        {/* Checkbox */}
                        <Checkbox
                          value={false}
                          onValueChange={() => handleToggleSelection(image.id, false)}
                          className="self-center"
                        />
                        {/* Image Preview */}
                        <div className="flex items-center justify-center w-16 h-16 overflow-hidden cursor-pointer">
                          {base64Images[image.id] ? (
                            <img
                              src={base64Images[image.id]}
                              alt={`${image.name}`}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>

                        {/* Image Details */}
                        <div className="flex flex-row items-center justify-between w-full gap-2">
                          <div className="flex flex-col">
                            <Text className={cn('truncate w-full font-medium')}>{truncateText(image.name, 17)}</Text>
                            <div className="flex flex-row items-center justify-between w-full gap-1">
                              <Text className="text-secondary-text">{truncateText(image.type, 10)}</Text>
                              <Text className="text-secondary-text">
                                {Math.round(image.dimensions.width)}x{Math.round(image.dimensions.height)}px
                              </Text>
                            </div>
                          </div>
                        </div>

                        {/* Disabled Drag Handle */}
                        <div className="ml-auto opacity-50 cursor-not-allowed drag-handle">
                          <DragIcon />
                        </div>
                      </div>
                    </div>
                  </Flipped>
                );
              })}
            </div>
          )}
        </div>
      </DragDropContext>
    </Flipper>
  );
};

export default DragListView;

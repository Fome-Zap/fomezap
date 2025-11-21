// src/components/ListaDraggable.jsx
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Item individual draggable
function ItemDraggable({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Componente principal de lista draggable
export default function ListaDraggable({ items, onReorder, renderItem, idKey = '_id' }) {
  const [itemsInternos, setItemsInternos] = useState(items);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer 8px de movimento para iniciar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = itemsInternos.findIndex((item) => item[idKey] === active.id);
      const newIndex = itemsInternos.findIndex((item) => item[idKey] === over.id);

      const newItems = arrayMove(itemsInternos, oldIndex, newIndex);
      setItemsInternos(newItems);

      // Chamar callback com novos items e suas novas ordens
      const itemsComOrdem = newItems.map((item, index) => ({
        id: item[idKey],
        ordem: index
      }));
      onReorder(itemsComOrdem, newItems);
    }
  };

  // Atualizar items internos quando props mudar
  useState(() => {
    setItemsInternos(items);
  }, [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemsInternos.map(item => item[idKey])}
        strategy={verticalListSortingStrategy}
      >
        {itemsInternos.map((item) => (
          <ItemDraggable key={item[idKey]} id={item[idKey]}>
            {renderItem(item)}
          </ItemDraggable>
        ))}
      </SortableContext>
    </DndContext>
  );
}

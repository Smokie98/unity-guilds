"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// A single sortable section wrapper
function SortableItem({ id, children, isAdmin }) {
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
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isAdmin && (
        <div
          className="drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          {"\u2630"}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * SortableSections — wraps children sections to enable drag-and-drop reordering.
 *
 * Props:
 * - sectionOrder: string[] — ordered section IDs
 * - isAdmin: boolean — whether to show drag handles
 * - onReorder: (newOrder: string[]) => void — called with new order
 * - sectionMap: Record<string, ReactNode> — maps section IDs to JSX
 * - activeSection: string — currently visible section
 */
export default function SortableSections({
  sectionOrder,
  isAdmin,
  onReorder,
  sectionMap,
  activeSection,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sectionOrder.indexOf(active.id);
      const newIndex = sectionOrder.indexOf(over.id);
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }, [sectionOrder, onReorder]);

  // Only show sections that exist in the sectionMap
  const visibleSections = sectionOrder.filter((id) => sectionMap[id]);

  if (!isAdmin) {
    // Non-admin: just render in order, no DnD
    return (
      <>
        {visibleSections.map((id) => (
          <div key={id}>{sectionMap[id]}</div>
        ))}
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleSections}
        strategy={verticalListSortingStrategy}
      >
        {visibleSections.map((id) => (
          <SortableItem key={id} id={id} isAdmin={isAdmin}>
            {sectionMap[id]}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

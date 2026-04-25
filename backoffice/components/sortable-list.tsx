"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal drag handle props the `renderItem` callback receives. Spread these
 * onto the element you want the user to be able to grab (usually a small
 * handle rather than the whole row).
 */
export type DragHandleProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
};

type SortableListProps<T> = {
  /** Items to render. Order is the current visual order. */
  items: T[];
  /** Extract a stable, unique id (string) for each item. */
  getId: (item: T) => string;
  /** Called with the new array order after the user finishes a drag. */
  onReorder: (next: T[]) => void;
  /** Renders a single row. `handle` spreads into your drag handle element. */
  renderItem: (item: T, handle: DragHandleProps, index: number) => ReactNode;
  className?: string;
  /**
   * When true, the entire item is draggable (useful for cards). Defaults to
   * false — only the element that receives the `handle` is draggable.
   */
  wholeItemDraggable?: boolean;
};

export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  className,
  wholeItemDraggable,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => getId(i) === active.id);
    const newIndex = items.findIndex((i) => getId(i) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableItem
              key={getId(item)}
              id={getId(item)}
              wholeItemDraggable={!!wholeItemDraggable}
            >
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  children,
  wholeItemDraggable,
}: {
  id: string;
  children: (handle: DragHandleProps) => ReactNode;
  wholeItemDraggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };

  const handle: DragHandleProps = {
    attributes,
    listeners,
    isDragging,
  };

  if (wholeItemDraggable) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children(handle)}
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

/**
 * Ready-made drag handle button with a grip icon. Spread the `handle` from
 * `renderItem` onto this.
 */
export function DragHandle({
  handle,
  className,
  title = "Drag to reorder",
}: {
  handle: DragHandleProps;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-400 hover:text-brand-ink hover:bg-surface-muted transition-colors touch-none cursor-grab active:cursor-grabbing",
        handle.isDragging && "cursor-grabbing text-brand-purple bg-brand-purple/10",
        className
      )}
      {...handle.attributes}
      {...handle.listeners}
    >
      <GripVertical size={16} strokeWidth={2} />
    </button>
  );
}

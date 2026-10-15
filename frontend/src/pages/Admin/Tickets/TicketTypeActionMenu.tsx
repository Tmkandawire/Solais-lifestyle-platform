import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

import type { TicketType } from "../../../types/ticket";

interface TicketTypeActionsMenuProps {
  ticketType: TicketType;
  onView: (ticketType: TicketType) => void;
  onEdit: (ticketType: TicketType) => void;
  onActivate: (ticketType: TicketType) => void;
  onDeactivate: (ticketType: TicketType) => void;
  onDelete: (ticketType: TicketType) => void;
}

interface ActionItemProps {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

const MENU_WIDTH = 208;
const MENU_HEIGHT = 260;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;

function ActionItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: ActionItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:bg-[#f5f1e9]",
        destructive
          ? "text-[#a84b45] hover:bg-[#a84b45]/7"
          : "text-[#122425]/75 hover:bg-[#f5f1e9] hover:text-[#122425]",
      ].join(" ")}
    >
      <Icon
        className={
          destructive ? "h-4 w-4 shrink-0" : "h-4 w-4 shrink-0 text-[#c99b55]"
        }
        strokeWidth={1.6}
      />

      <span>{label}</span>
    </button>
  );
}

export default function TicketTypeActionMenu({
  ticketType,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: TicketTypeActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canEdit = ticketType.deletedAt === null;

  const canActivate =
    ticketType.status === "INACTIVE" && ticketType.deletedAt === null;

  const canDeactivate =
    ticketType.status === "ACTIVE" && ticketType.deletedAt === null;

  const canDelete = ticketType.deletedAt === null;

  function updateMenuPosition() {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    const shouldOpenAbove =
      spaceBelow < MENU_HEIGHT + MENU_GAP + VIEWPORT_PADDING &&
      spaceAbove > MENU_HEIGHT + MENU_GAP + VIEWPORT_PADDING;

    const placement = shouldOpenAbove ? "top" : "bottom";

    let top = shouldOpenAbove
      ? triggerRect.top - MENU_HEIGHT - MENU_GAP
      : triggerRect.bottom + MENU_GAP;

    let left = triggerRect.right - MENU_WIDTH;

    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, viewportHeight - MENU_HEIGHT - VIEWPORT_PADDING),
    );

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, viewportWidth - MENU_WIDTH - VIEWPORT_PADDING),
    );

    setMenuPosition({
      top,
      left,
      placement,
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleViewportChange() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  function closeAndRun(action: () => void) {
    setIsOpen(false);
    action();
  }

  function toggleMenu() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    updateMenuPosition();
    setIsOpen(true);
  }

  const menu =
    isOpen && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Actions for ${ticketType.name}`}
            className={[
              "fixed z-[9999] w-52 overflow-hidden",
              "rounded-xl border border-[#122425]/8",
              "bg-white py-1.5",
              "shadow-[0_16px_40px_rgba(18,36,37,0.14)]",
              "animate-in fade-in duration-100",
            ].join(" ")}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            <div className="border-b border-[#122425]/7 px-3.5 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c99b55]">
                Ticket actions
              </p>
            </div>

            <div className="py-1">
              <ActionItem
                icon={Eye}
                label="View ticket type"
                onClick={() => closeAndRun(() => onView(ticketType))}
              />

              {canEdit && (
                <ActionItem
                  icon={Pencil}
                  label="Edit ticket type"
                  onClick={() => closeAndRun(() => onEdit(ticketType))}
                />
              )}

              {canActivate && (
                <ActionItem
                  icon={Power}
                  label="Activate ticket type"
                  onClick={() => closeAndRun(() => onActivate(ticketType))}
                />
              )}

              {canDeactivate && (
                <ActionItem
                  icon={PowerOff}
                  label="Deactivate ticket type"
                  onClick={() => closeAndRun(() => onDeactivate(ticketType))}
                />
              )}
            </div>

            {canDelete && (
              <>
                <div className="mx-3 border-t border-[#122425]/7" />

                <div className="py-1">
                  <ActionItem
                    icon={Trash2}
                    label="Delete ticket type"
                    destructive
                    onClick={() => closeAndRun(() => onDelete(ticketType))}
                  />
                </div>
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${ticketType.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full sm:h-9 sm:w-9",
          "border border-transparent",
          "text-[#122425]/35 transition-all duration-150",
          "hover:border-[#122425]/8 hover:bg-[#f5f1e9]",
          "hover:text-[#122425]",
          "focus:outline-none focus-visible:border-[#c99b55]/40",
          "focus-visible:bg-[#c99b55]/8",
          isOpen ? "border-[#c99b55]/30 bg-[#c99b55]/8 text-[#122425]" : "",
        ].join(" ")}
      >
        <MoreHorizontal className="h-4 w-4" strokeWidth={1.7} />
      </button>

      {menu}
    </>
  );
}

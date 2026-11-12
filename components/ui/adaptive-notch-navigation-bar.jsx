"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutGroup, motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotchLeftWing({ position = "top", className }) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-full size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 C 11.046 20 20 11.046 20 0 H 21 V 21 H 0 Z"
            : "M 0 0 C 11.046 0 20 8.954 20 20 H 21 V -1 H 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchRightWing({ position = "top", className }) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-full size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 C 8.954 20 0 11.046 0 0 H -1 V 21 H 20 Z"
            : "M 20 0 C 8.954 0 0 8.954 0 20 H -1 V -1 H 20 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerLeftWing({ position = "top", className }) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute left-0 size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 0 20 H 20 C 8.954 20 0 11.046 0 0 V 20 Z"
            : "M 0 0 H 20 C 8.954 0 0 8.954 0 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function NotchCornerRightWing({ position = "top", className }) {
  const isBottom = position === "bottom";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cn(
        "pointer-events-none absolute right-0 size-2.5 md:size-4 overflow-visible select-none text-black transition-colors duration-200",
        isBottom ? "bottom-full" : "top-full",
        className
      )}
    >
      <path
        d={
          isBottom
            ? "M 20 20 H 0 C 11.046 20 20 11.046 20 0 V 20 Z"
            : "M 20 0 H 0 C 11.046 0 20 8.954 20 20 V 0 Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}

export const NotchItem = forwardRef(
  (
    {
      id,
      label,
      isActive,
      icon: Icon,
      badge,
      disabled,
      className,
      onClick,
      onSelect,
      href,
      ...props
    },
    ref
  ) => {
    const handleClick = (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onSelect?.(id);
      onClick?.(event);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!disabled) {
          onSelect?.(id);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex h-8 cursor-pointer items-center gap-1.5 rounded-[8px] px-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
          isActive
            ? "text-black"
            : "text-zinc-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] rounded-[8px]",
          disabled && "cursor-not-allowed pointer-events-none opacity-40",
          className
        )}
        {...props}
      >
        {isActive && (
          <motion.span
            layoutId="notch-active-pill"
            className="absolute inset-0 rounded-[8px] bg-white shadow-sm"
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32,
            }}
          />
        )}

        <span className="relative z-10 flex items-center gap-1.5">
          {Icon && (
            <Icon
              className={cn(
                "size-3.5 shrink-0 transition-colors duration-150",
                isActive ? "text-black" : "text-zinc-400 group-hover:text-white"
              )}
            />
          )}

          <span className="leading-none">{label}</span>

          {badge && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "bg-white/15 text-white"
              )}
            >
              {badge}
            </span>
          )}
        </span>
      </button>
    );
  }
);
NotchItem.displayName = "NotchItem";

function NotchDropdownItem({ item, isSelected, onSelect }) {
  const Icon = item.icon;

  const handleClick = (e) => {
    onSelect(item.id, e);
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={item.disabled}
      onClick={handleClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-xs uppercase tracking-wider font-semibold outline-none transition-all duration-150 select-none",
        "focus-visible:ring-2 focus-visible:ring-white",
        isSelected
          ? "bg-white text-black font-bold shadow-sm"
          : "text-zinc-300 hover:bg-white/10 hover:text-white active:bg-white/15",
        item.disabled && "cursor-not-allowed pointer-events-none opacity-40"
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <Icon
            className={cn(
              "size-4 shrink-0",
              isSelected ? "text-black" : "text-zinc-400"
            )}
          />
        )}
        <span>{item.label}</span>
      </div>

      {isSelected && <Check className="size-3.5 text-black stroke-[2.5]" />}
    </button>
  );
}

export function NotchNav({
  items = [],
  activeId: controlledActiveId,
  defaultActiveId,
  position = "top",
  logo,
  rightContent,
  showLogo = true,
  showRightContent = true,
  children,
  onActiveChange,
  className,
  ...props
}) {
  const containerRef = useRef(null);
  const layoutGroupId = useId();

  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId || items[0]?.id || ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isBottom = position === "bottom";

  const activeId =
    controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.id === activeId);
    return index >= 0 ? index : 0;
  }, [items, activeId]);

  const activeItem = items[activeIndex] || items[0];

  const handleSelect = useCallback(
    (id, event) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
      setIsDropdownOpen(false);
      onActiveChange?.(id, event);
    },
    [controlledActiveId, onActiveChange]
  );

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-[10000] pointer-events-none select-none",
        isBottom ? "bottom-0" : "top-0",
        className
      )}
      {...props}
    >
      {/* 1. Desktop Left Logo Notch */}
      {showLogo && logo && (
        <aside
          aria-label="Brand logo notch"
          className={cn(
            "hidden xl:flex absolute left-0 z-50 h-10 px-5 select-none transition-colors duration-200 bg-[#050608]/95 backdrop-blur-xl text-white pointer-events-auto border-b border-r border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]",
            isBottom
              ? "bottom-0 rounded-tr-[20px] items-end pb-1"
              : "top-0 rounded-br-[20px] items-center"
          )}
        >
          <div className="flex items-center text-white">{logo}</div>
          <NotchRightWing position={position} />
          <NotchCornerLeftWing position={position} />
        </aside>
      )}

      {/* 2. Desktop Center Menu Notch */}
      <header
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "hidden xl:flex absolute left-1/2 -translate-x-1/2 z-50 h-11 px-3.5 bg-[#050608]/95 backdrop-blur-xl text-white select-none transition-colors duration-200 pointer-events-auto border-b border-x border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]",
          isBottom
            ? "bottom-0 rounded-t-[20px] items-end pb-1"
            : "top-0 rounded-b-[20px] items-center"
        )}
      >
        <NotchLeftWing position={position} />
        <NotchRightWing position={position} />

        <LayoutGroup id={layoutGroupId}>
          <div className="flex items-center gap-1">
            {items.map((item) => (
              <NotchItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                disabled={item.disabled}
                isActive={item.id === activeId}
                onSelect={(id) => handleSelect(id)}
              />
            ))}
          </div>
        </LayoutGroup>
      </header>

      {/* 3. Desktop Right Action Notch */}
      {showRightContent && rightContent && (
        <aside
          aria-label="User actions notch"
          className={cn(
            "hidden xl:flex absolute right-0 z-50 h-11 px-5 select-none transition-colors duration-200 bg-[#050608]/95 backdrop-blur-xl text-white pointer-events-auto border-b border-l border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]",
            isBottom
              ? "bottom-0 rounded-tl-[20px] items-end pb-1"
              : "top-0 rounded-bl-[20px] items-center"
          )}
        >
          <NotchLeftWing position={position} />
          <NotchCornerRightWing position={position} />

          <div className="flex items-center text-white">{rightContent}</div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* TABLET & MOBILE VIEW (< 1280px): SINGLE COMPACT NOTCH ISLAND              */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        className={cn(
          "xl:hidden absolute z-50 flex flex-col bg-[#050608]/95 backdrop-blur-xl text-white select-none pointer-events-auto border-b border-x border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "w-[calc(100%-20px)] sm:w-[calc(100%-28px)] max-w-lg left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-1",
          isBottom ? "bottom-0 rounded-t-[20px]" : "top-0 rounded-b-[20px]"
        )}
      >
        <NotchLeftWing position={position} className="hidden md:block" />
        <NotchRightWing position={position} className="hidden md:block" />

        {/* Unified Horizontal Bar */}
        <div
          className={cn(
            "w-full flex h-10 items-center justify-between gap-1.5 sm:gap-2",
            isBottom ? "items-baseline" : "items-center"
          )}
        >
          {/* Left Logo Slot */}
          {showLogo && logo && (
            <div className="flex shrink-0 items-center text-white origin-left">
              {logo}
            </div>
          )}

          {/* Right Action & Menu Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Clean Mobile Menu Trigger */}
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Toggle navigation menu"
              onClick={handleToggleDropdown}
              className="flex h-7 px-2 sm:px-2.5 cursor-pointer items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-mono font-semibold uppercase tracking-wider text-white outline-none transition-all"
            >
              {isDropdownOpen ? (
                <X className="size-3.5 text-white/90" />
              ) : (
                <Menu className="size-3.5 text-white/90" />
              )}
              <span className="hidden min-[380px]:inline">Menu</span>
            </button>

            {/* Right Action Slot (Avatar / Register) */}
            {showRightContent && rightContent && (
              <div className="flex shrink-0 items-center text-white origin-right">
                {rightContent}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mt-2 w-full flex flex-col gap-1 border-t border-white/10 pt-2 pb-1"
            >
              {items.map((item) => (
                <NotchDropdownItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === activeId}
                  onSelect={(id, e) => handleSelect(id, e)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

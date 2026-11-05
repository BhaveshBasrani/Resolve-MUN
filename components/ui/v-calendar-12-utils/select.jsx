"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

const SelectContext = React.createContext(null);

export function Select({
  value,
  onValueChange,
  items = [],
  "aria-label": ariaLabel,
  children,
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selectedItem = React.useMemo(
    () => items.find((it) => String(it.value) === String(value)),
    [items, value]
  );

  return (
    <SelectContext.Provider
      value={{
        value: value !== undefined && value !== null ? String(value) : "",
        onValueChange: (val) => {
          if (onValueChange) onValueChange(val);
          setOpen(false);
        },
        open,
        setOpen,
        selectedLabel: selectedItem ? selectedItem.label : value,
        ariaLabel,
      }}
    >
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <button
      type="button"
      aria-label={ctx.ariaLabel}
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "inline-flex items-center justify-between gap-1.5 rounded-lg border border-white/20 bg-[#0a0a0a] px-2.5 py-1.5 text-xs font-semibold text-white hover:border-white/45 hover:bg-[#141414] focus:outline-none focus:border-white transition-colors cursor-pointer select-none",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 text-white/60 transition-transform duration-150",
          ctx.open && "rotate-180 text-white"
        )}
      />
    </button>
  );
}

export function SelectValue() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return <span className="truncate">{ctx.selectedLabel}</span>;
}

export function SelectPopup({ className, children }) {
  const ctx = React.useContext(SelectContext);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (ctx?.open && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl && activeEl.scrollIntoView) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [ctx?.open]);

  if (!ctx || !ctx.open) return null;

  return (
    <div
      ref={listRef}
      role="listbox"
      data-lenis-prevent
      className={cn(
        "absolute left-0 top-full z-[100020] mt-1 max-h-52 min-w-[7.5rem] overflow-y-auto rounded-xl border border-white/25 bg-[#080808] p-1 text-white shadow-[0_16px_40px_rgba(0,0,0,0.95)]",
        className
      )}
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.3) transparent" }}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, disabled, className, children }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const isSelected = String(ctx.value) === String(value);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected ? "true" : "false"}
      disabled={disabled}
      onClick={() => {
        if (!disabled) ctx.onValueChange(String(value));
      }}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors cursor-pointer",
        isSelected
          ? "bg-white text-black font-bold"
          : "text-white/85 hover:bg-white/10 hover:text-white",
        disabled && "opacity-35 pointer-events-none cursor-not-allowed",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="h-3 w-3 shrink-0 text-black" />}
    </button>
  );
}


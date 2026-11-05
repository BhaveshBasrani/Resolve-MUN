"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({
  captionLayout = "dropdown",
  components = {},
  defaultMonth,
  disabled,
  startMonth = new Date(1900, 0),
  endMonth = new Date(),
  selected,
  onSelect,
  className,
}) {
  const initialMonth = selected || defaultMonth || new Date(2008, 0);
  const [viewYear, setViewYear] = React.useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initialMonth.getMonth());

  React.useEffect(() => {
    if (selected instanceof Date && !isNaN(selected.getTime())) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [selected]);

  const minYear = startMonth ? startMonth.getFullYear() : 1900;
  const maxYear = endMonth ? endMonth.getFullYear() : new Date().getFullYear();
  const afterDate = disabled?.after || endMonth || new Date();

  const monthOptions = React.useMemo(() => {
    return MONTH_NAMES.map((label, idx) => {
      const isAfterMax =
        viewYear === afterDate.getFullYear() && idx > afterDate.getMonth();
      return {
        label,
        value: idx,
        disabled: isAfterMax,
      };
    });
  }, [viewYear, afterDate]);

  const yearOptions = React.useMemo(() => {
    const yrs = [];
    for (let y = maxYear; y >= minYear; y--) {
      yrs.push({
        label: String(y),
        value: y,
        disabled: false,
      });
    }
    return yrs;
  }, [minYear, maxYear]);

  const handleMonthChange = (e) => {
    const nextMonth = Number(e?.target?.value ?? e);
    if (!isNaN(nextMonth)) {
      setViewMonth(nextMonth);
    }
  };

  const handleYearChange = (e) => {
    const nextYear = Number(e?.target?.value ?? e);
    if (!isNaN(nextYear)) {
      setViewYear(nextYear);
      if (
        nextYear === afterDate.getFullYear() &&
        viewMonth > afterDate.getMonth()
      ) {
        setViewMonth(afterDate.getMonth());
      }
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear(viewYear - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (
      nextY > afterDate.getFullYear() ||
      (nextY === afterDate.getFullYear() && nextM > afterDate.getMonth())
    ) {
      return;
    }
    setViewYear(nextY);
    setViewMonth(nextM);
  };

  const DropdownComponent = components?.Dropdown;

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
    cells.push({ date: d, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), outside: false });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(viewYear, viewMonth + 1, d), outside: true });
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-[#070707] p-3 text-white shadow-inner select-none",
        className
      )}
    >
      {/* Header with Month / Year Dropdowns & Prev/Next */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Previous month"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#0d0d0d] text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {captionLayout === "dropdown" && DropdownComponent ? (
          <div className="flex items-center gap-1.5">
            <DropdownComponent
              aria-label="Choose the Month"
              options={monthOptions}
              value={viewMonth}
              onChange={handleMonthChange}
            />
            <DropdownComponent
              aria-label="Choose the Year"
              options={yearOptions}
              value={viewYear}
              onChange={handleYearChange}
            />
          </div>
        ) : (
          <div className="text-xs font-bold tracking-wide text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
        )}

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Next month"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#0d0d0d] text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-[10px] font-bold uppercase tracking-wider text-white/45 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const cellTime = new Date(
            cell.date.getFullYear(),
            cell.date.getMonth(),
            cell.date.getDate()
          ).getTime();
          const isDisabled =
            afterDate && cellTime > afterDate.getTime();
          const isSelected = selected && isSameDay(cell.date, selected);

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && onSelect) {
                  onSelect(cell.date);
                }
              }}
              className={cn(
                "h-7 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center cursor-pointer",
                isSelected
                  ? "bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                  : cell.outside
                  ? "text-white/25 hover:bg-white/5 hover:text-white/50"
                  : "text-white/90 hover:bg-white/15 hover:text-white",
                isDisabled &&
                  "opacity-20 pointer-events-none cursor-not-allowed"
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}


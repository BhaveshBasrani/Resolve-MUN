"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Calendar } from "@/components/ui/v-calendar-12-utils/calendar";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/v-calendar-12-utils/select";

function CalendarDropdown(props) {
  const { options, value, onChange, "aria-label": ariaLabel } = props;

  const handleValueChange = (newValue) => {
    if (onChange && newValue !== null && newValue !== undefined) {
      const syntheticEvent = {
        target: { value: newValue },
      };
      onChange(syntheticEvent);
    }
  };

  const items =
    options?.map((option) => ({
      disabled: option.disabled,
      label: option.label,
      value: option.value.toString(),
    })) ?? [];

  return (
    <Select
      aria-label={ariaLabel}
      items={items}
      onValueChange={handleValueChange}
      value={value?.toString()}
    >
      <SelectTrigger className="min-w-none">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {items.map((item) => (
          <SelectItem
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function calcAge(dob) {
  const diff = today.getTime() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function formatYyyyMmDd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYyyyMmDd(str) {
  if (!str || typeof str !== "string") return undefined;
  const parts = str.trim().split("-");
  if (parts.length !== 3) return undefined;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  if (isNaN(y) || isNaN(m) || isNaN(d) || y < 1900) return undefined;
  const dt = new Date(y, m, d);
  return isNaN(dt.getTime()) ? undefined : dt;
}

export function Particle({ inputId }) {
  const [date, setDate] = React.useState(undefined);

  // Sync initial value from hidden/associated input (e.g., restored from localStorage)
  React.useEffect(() => {
    if (!inputId || typeof document === "undefined") return;
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    const syncFromInput = () => {
      if (!inputEl.value) {
        setDate(undefined);
        return;
      }
      const parsed = parseYyyyMmDd(inputEl.value);
      if (parsed) {
        setDate((prev) =>
          prev && formatYyyyMmDd(prev) === formatYyyyMmDd(parsed) ? prev : parsed
        );
      }
    };

    syncFromInput();
    inputEl.addEventListener("change", syncFromInput);
    inputEl.addEventListener("input", syncFromInput);
    return () => {
      inputEl.removeEventListener("change", syncFromInput);
      inputEl.removeEventListener("input", syncFromInput);
    };
  }, [inputId]);

  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate);
    if (inputId && typeof document !== "undefined") {
      const inputEl = document.getElementById(inputId);
      if (inputEl) {
        inputEl.value = selectedDate ? formatYyyyMmDd(selectedDate) : "";
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        // Clear any validation error message next to the input
        inputEl.style.borderColor = "";
        const errSpan = inputEl.parentElement?.querySelector(".error-message");
        if (errSpan) errSpan.remove();
      }
    }
  };

  const age = date ? calcAge(date) : null;

  return (
    <div className="flex flex-col gap-2.5">
      <Calendar
        captionLayout="dropdown"
        components={{ Dropdown: CalendarDropdown }}
        defaultMonth={new Date(1990, 0)}
        disabled={{ after: today }}
        endMonth={today}
        mode="single"
        onSelect={handleSelectDate}
        selected={date}
        startMonth={new Date(1900, 0)}
      />
      <div className="rounded-xl border border-white/20 bg-[#0a0a0a] px-4 py-2.5 text-sm text-white">
        {date && age !== null ? (
          <p className="!m-0 !text-sm !leading-snug text-white">
            Date of birth:{" "}
            <span className="font-semibold text-white">
              {date.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="ml-2 text-white/60">
              ({age} years old)
            </span>
          </p>
        ) : (
          <p className="!m-0 !text-sm !leading-snug text-white/50">
            Select your date of birth.
          </p>
        )}
      </div>
    </div>
  );
}

const DOB_MOUNTS = [
  { mountId: "regDobMount", inputId: "regDob" },
  { mountId: "ocDobMount", inputId: "ocDob" },
  { mountId: "secDobMount", inputId: "secDob" },
  { mountId: "ebDobMount", inputId: "ebDob" },
  { mountId: "socialsDobMount", inputId: "socialsDob" },
];

export default function DobPickerPortals() {
  const [targets, setTargets] = React.useState([]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const findMounts = () => {
      const found = [];
      for (const item of DOB_MOUNTS) {
        const el = document.getElementById(item.mountId);
        if (el) {
          found.push({ ...item, el });
        }
      }
      setTargets(found);
    };

    findMounts();
    const t1 = setTimeout(findMounts, 250);
    const t2 = setTimeout(findMounts, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!targets.length) return null;

  return (
    <>
      {targets.map(({ mountId, inputId, el }) =>
        createPortal(<Particle key={mountId} inputId={inputId} />, el)
      )}
    </>
  );
}


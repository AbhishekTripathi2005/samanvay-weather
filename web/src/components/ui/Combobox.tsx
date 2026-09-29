"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.group && o.group.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative font-mono text-xs w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-[var(--text-1)] hover:border-[var(--border-strong)] focus:outline-none"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : <span className="text-[var(--text-3)]">{placeholder}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--text-3)]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="relative mb-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-3)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded bg-[var(--surface-3)] py-1.5 pl-8 pr-2 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-3 text-center text-xs text-[var(--text-3)]">No matches found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition",
                    value === opt.value
                      ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-bold"
                      : "text-[var(--text-2)] hover:bg-[var(--surface-3)] hover:text-[var(--text-1)]"
                  )}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="h-3.5 w-3.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

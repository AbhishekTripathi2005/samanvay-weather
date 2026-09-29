"use client";

import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search table...",
  pageSize = 8,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchKey || !search) return data;
    return data.filter((item) =>
      String(item[searchKey] || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, searchKey, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filtered, sortKey, sortOrder]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className={cn("space-y-3 font-mono text-xs w-full", className)}>
      {searchKey && (
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] py-1.5 pl-8 pr-3 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
        <table className="w-full text-left">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-3)] uppercase text-[10px]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "py-3 px-3.5 font-bold tracking-wider",
                    col.sortable && "cursor-pointer select-none hover:text-[var(--text-1)]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    className={cn(
                      "flex items-center space-x-1",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-[var(--accent-cyan)]" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-[var(--accent-cyan)]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-[var(--text-3)]">
                  No records found
                </td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface-3)]/40 transition">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-2.5 px-3.5 text-[var(--text-2)]",
                        col.align === "right" && "text-right font-medium",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? "--")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[11px] text-[var(--text-3)] px-1">
          <span>
            Page {page} of {totalPages} ({sorted.length} total)
          </span>
          <div className="flex space-x-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded border border-[var(--border)] px-2 py-0.5 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded border border-[var(--border)] px-2 py-0.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

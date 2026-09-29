// SAMANVAY Operational Export Utilities
// MoES / NCMRWF (PS 26081)
// Client-side offline RFC 4180 CSV export, high-res PNG canvas export, and link sharing

import { toast } from "sonner";

/**
 * Escapes a cell according to RFC 4180.
 * If the value contains commas, quotes, or newlines, wraps in quotes and escapes internal quotes.
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Client-side RFC 4180 CSV export with BOM for Excel compatibility.
 */
export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns?: { key: string; label: string }[]
): void {
  if (!rows || rows.length === 0) {
    toast.error("No data available to export");
    return;
  }

  const effectiveColumns =
    columns ||
    Object.keys(rows[0]).map((key) => ({
      key,
      label: key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    }));

  const headerLine = effectiveColumns.map((col) => escapeCsvCell(col.label)).join(",");
  const dataLines = rows.map((row) =>
    effectiveColumns.map((col) => escapeCsvCell(row[col.key])).join(",")
  );

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${rows.length} rows to ${filename}`);
}

/**
 * Export an SVG/Chart element as a crisp, high-resolution PNG image.
 */
export async function exportElementAsPng(elementId: string, filename: string): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    toast.error(`Export target '${elementId}' not found`);
    return;
  }

  try {
    const svgElem = container.querySelector("svg");
    if (!svgElem) {
      toast.error("No SVG chart found inside target container");
      return;
    }

    const svgRect = svgElem.getBoundingClientRect();
    const width = svgRect.width || 800;
    const height = svgRect.height || 400;
    const scale = 2; // 2x retina crispness

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElem);

    // Ensure proper namespaces and xmlns
    if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = blobUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create 2D canvas context");

    // Dark operational background fill
    ctx.fillStyle = "#070B14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobUrl);

    // Add watermark
    ctx.font = `${10 * scale}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
    ctx.fillText("SAMANVAY • MoES / NCMRWF (PS 26081)", 16 * scale, canvas.height - 16 * scale);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        toast.error("Failed to generate PNG blob");
        return;
      }
      const pngUrl = URL.createObjectURL(pngBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pngUrl);
      toast.success(`Exported chart to ${filename}`);
    }, "image/png");
  } catch (err: any) {
    console.error("PNG export error:", err);
    toast.error(`Export PNG failed: ${err.message || "Unknown error"}`);
  }
}

/**
 * Generates a shareable URL containing current operational parameters and copies it to clipboard.
 */
export async function copyShareLink(params: Record<string, any>, path: string = window.location.pathname): Promise<void> {
  try {
    const url = new URL(window.location.origin + path);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          url.searchParams.set(key, JSON.stringify(value));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });

    const shareUrl = url.toString();
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Shareable operational link copied to clipboard!", {
      description: shareUrl
    });
  } catch (err: any) {
    console.error("Failed to copy link:", err);
    toast.error("Could not copy link to clipboard");
  }
}

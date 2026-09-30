"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface KatexMathProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function KatexMath({ math, block = false, className = "" }: KatexMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
        output: "htmlAndMathml"
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
      return `<code class="text-rose-400 font-mono">${math}</code>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-3 overflow-x-auto text-cyan-300 py-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block text-cyan-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

"use client";

import Markdown from "react-markdown";

export function MarkdownParser({ children }: { children: string }) {
  return (
    <Markdown>
      {children}
    </Markdown>
  );
}
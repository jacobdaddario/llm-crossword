"use client";

import Markdown from "react-markdown";

export function Content({ children }: { children: string }) {
  return (
    <div className="p-2 text-sm prose">
      <Markdown>{children}</Markdown>
    </div>
  );
}

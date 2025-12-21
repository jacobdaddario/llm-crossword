"use client";

import Markdown from "react-markdown";

export function Thought({ children }: { children: string }) {
  return (
    <>
      <h2 className="text-xs font-bold text-gray-900 mb-1 ml-2">Thinking...</h2>
      <div className="bg-gray-100 shadow-inner border border-gray-200/75 rounded p-2 text-sm prose">
        <Markdown>{children}</Markdown>
      </div>
    </>
  );
}

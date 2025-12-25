"use client";

export function ToolInvocation({
  toolName,
  children,
}: {
  toolName: string;
  children: string;
}) {
  return (
    <>
      <h3 className="text-xs font-bold text-gray-900 mb-1 ml-2">{toolName}</h3>
      <pre className="bg-gray-100 shadow-inner border border-gray-200/75 rounded p-2 text-sm font-mono overflow-y-auto">
        {children}
      </pre>
    </>
  );
}

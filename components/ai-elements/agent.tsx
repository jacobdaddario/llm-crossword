import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type AgentToolLike = {
  description?: string;
  inputSchema?: unknown;
};

export function Agent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border border-gray-200 rounded-lg bg-white", className)}
      {...props}
    />
  );
}

export function AgentHeader({
  name,
  model,
  className,
  ...props
}: ComponentProps<"div"> & { name: string; model?: string }) {
  return (
    <div
      className={cn("px-4 py-3 border-b border-gray-200 flex items-center gap-2", className)}
      {...props}
    >
      <p className="font-medium text-sm text-gray-900">{name}</p>
      {model ? (
        <span className="text-xs border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
          {model}
        </span>
      ) : null}
    </div>
  );
}

export function AgentContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4 space-y-4", className)} {...props} />;
}

export function AgentInstructions({
  children,
  className,
  ...props
}: ComponentProps<"div"> & { children: string }) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Instructions</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{children}</p>
    </div>
  );
}

export function AgentTools({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tools</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function AgentTool({
  tool,
  value,
  className,
  ...props
}: ComponentProps<"details"> & { tool: AgentToolLike; value: string }) {
  return (
    <details
      className={cn("border border-gray-200 rounded-md px-3 py-2", className)}
      {...props}
    >
      <summary className="cursor-pointer text-sm text-gray-900">{tool.description ?? value}</summary>
      <pre className="mt-2 text-xs text-gray-700 overflow-x-auto">
        {typeof tool.inputSchema === "string"
          ? tool.inputSchema
          : JSON.stringify(tool.inputSchema ?? {}, null, 2)}
      </pre>
    </details>
  );
}

export function AgentOutput({
  schema,
  className,
  ...props
}: ComponentProps<"div"> & { schema: string }) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Output</p>
      <pre className="text-xs text-gray-700 border border-gray-200 rounded-md p-3 overflow-x-auto">
        {schema}
      </pre>
    </div>
  );
}

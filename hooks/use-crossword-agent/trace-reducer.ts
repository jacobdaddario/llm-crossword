import type { ToolEvaluation } from "@/components/llm/tools";
import type { ToolCall } from "ollama";

type AgentTransactionTypes =
  | "content"
  | "thought"
  | "tool_call"
  | "tool_evaluation";

export type AgentTransaction = {
  type: AgentTransactionTypes;
  text: string;
  title?: string;
};

export type AgentTrace = AgentTransaction[];

type TraceMutation =
  | { type: "append_content"; text: string }
  | { type: "append_thinking"; text: string }
  | {
      type: "append_tool_call";
      toolCall: ToolCall;
      toolEvaluation: ToolEvaluation;
    }
  | { type: "truncate" };

function updateTransaction(transaction: AgentTransaction, newChunk: string) {
  return {
    ...transaction,
    text: transaction.text + newChunk,
  };
}

function updateTrace(trace: AgentTrace, newChunk: AgentTransaction) {
  const mostRecentTrace = trace.at(-1);

  // NOTE: Tool calls all get their own trace.
  return mostRecentTrace?.type !== "tool_call" &&
    mostRecentTrace?.type !== "tool_evaluation" &&
    mostRecentTrace?.type === newChunk.type
    ? [
        ...trace.slice(0, -1),
        updateTransaction(mostRecentTrace, newChunk.text as string),
      ]
    : [...trace, newChunk];
}

export function traceReducer(state: AgentTrace, action: TraceMutation) {
  switch (action.type) {
    case "append_content":
      return updateTrace(state, { type: "content", text: action.text });
    case "append_thinking":
      return updateTrace(state, { type: "thought", text: action.text });
    case "append_tool_call":
      const toolCall = action.toolCall.function;
      const name = toolCall.name;

      return updateTrace(
        updateTrace(state, {
          title: name,
          text: JSON.stringify(toolCall, null, 2),
          type: "tool_call",
        }),
        {
          title: name,
          text: action.toolEvaluation.content,
          type: "tool_evaluation",
        },
      );
    case "truncate":
      if (state.length <= 40) return state;
      return state.toSpliced(0, state.length - 40);
  }
}

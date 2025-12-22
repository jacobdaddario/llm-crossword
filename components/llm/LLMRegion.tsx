"use client";

import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import type { ToolCall } from "ollama/browser";

import { AgentToggle } from "@/components/llm/AgentToggle";
import { Thought } from "@/components/llm/Thought";
import { Content } from "@/components/llm/Content";
import { ToolInvocation } from "@/components/llm/ToolInvocation";
import {
  type AgentTransaction,
  useCrosswordAgent,
} from "@/hooks/use-crossword-agent";

function renderTransaction(transaction: AgentTransaction): React.ReactNode {
  let renderedComponent: React.ReactNode;

  switch (transaction.type) {
    case "thought":
      renderedComponent = <Thought>{transaction.text as string}</Thought>;
      break;
    case "content":
      renderedComponent = <Content>{transaction.text as string}</Content>;
      break;
    case "tool_call":
      const toolCall = transaction.text as ToolCall;

      renderedComponent = (
        <ToolInvocation toolName={toolCall.function.name}>
          {JSON.stringify(toolCall, null, 2)}
        </ToolInvocation>
      );
      break;
  }

  return renderedComponent;
}

export function LLMRegion() {
  const { response, toggleAgent } = useCrosswordAgent({
    model: "gpt-oss:20b",
  });

  return (
    <div className="absolute space-x-2 bottom-8 right-12">
      <Popover>
        <PopoverTrigger asChild>
          <Button>
            <SparklesIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-xl max-h-168 flex flex-col-reverse overflow-y-auto"
        >
          <div className="relative px-2 pt-4 pb-16">
            {response.map((transaction: AgentTransaction, idx: number) => {
              // NOTE: Typically using idx is not a good practice with `key`, but in this case,
              // the rendered content _must_ remain ordered to be correct, so the index should
              // be a stable key.
              return (
                <div key={idx} className="mt-4 first:mt-0">
                  {renderTransaction(transaction)}
                </div>
              );
            })}

            <div className="absolute bottom-0 inset-x-0 pt-3.5 bg-white border-t border-gray-300 flex justify-end items-center">
              <AgentToggle onClick={toggleAgent} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

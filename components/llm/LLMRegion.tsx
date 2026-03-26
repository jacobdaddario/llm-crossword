"use client";

import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SparklesIcon } from "lucide-react";

import { AgentToggle } from "@/components/llm/AgentToggle";
import { Content } from "@/components/llm/Content";
import { Thought } from "@/components/llm/Thought";
import { ToolInvocation } from "@/components/llm/ToolInvocation";
import { useCrosswordAgent } from "@/hooks/use-crossword-agent";
import type { AgentTransaction } from "@/hooks/use-crossword-agent/trace-reducer";
import { upperFirst } from "lodash";
import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";

function renderTransaction(transaction: AgentTransaction): React.ReactNode {
  let renderedComponent: React.ReactNode;

  switch (transaction.type) {
    case "thought":
      renderedComponent = <Thought>{transaction.text}</Thought>;
      break;
    case "content":
      renderedComponent = <Content>{transaction.text}</Content>;
      break;
    case "tool_call":
      renderedComponent = (
        <ToolInvocation
          toolName={
            upperFirst(transaction.title).replaceAll("_", " ") ?? "Unknown tool"
          }
        >
          {transaction.text}
        </ToolInvocation>
      );
      break;
    case "tool_evaluation":
      renderedComponent = (
        <ToolInvocation
          toolName={
            upperFirst(transaction.title).replaceAll("_", " ") ?? "Unknown tool"
          }
        >
          {transaction.text}
        </ToolInvocation>
      );
      break;
  }

  return renderedComponent;
}

export function LLMRegion() {
  const { response, toggleAgent } = useCrosswordAgent({
    model: "gpt-oss:120b",
  });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    toggleAgent(running);

    return () => {
      toggleAgent(false);
    };
  }, [running, toggleAgent]);

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
          className="w-xl max-h-132 flex flex-col-reverse overflow-y-auto"
        >
          <div className="relative px-2 pt-4 pb-16">
            <div>
              <EmptyState onClick={() => setRunning(true)} />

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
            </div>

            <div className="absolute bottom-0 inset-x-0 pt-3.5 bg-white border-t border-gray-300 flex justify-end items-center">
              <AgentToggle
                onClick={() => setRunning(!running)}
                running={running}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

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
    case "content":
      renderedComponent = <Content>{transaction.text}</Content>;
      break;
  }

  return renderedComponent;
}

export function LLMRegion({}) {
  const { response } = useCrosswordAgent({ model: "gpt-oss:20b" });

  return (
    <div className="absolute bottom-8 right-12">
      <Popover defaultOpen={true}>
        <PopoverTrigger asChild>
          <Button>
            <SparklesIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-xl max-h-192 flex flex-col-reverse overflow-y-auto"
        >
          <div className="px-2 py-4">
            {response.map((transaction: AgentTransaction, idx: number) => {
              // NOTE: Typically using idx is not a good practice with `key`, but in this case,
              // the rendered content _must_ remain ordered to be correct, so the index should
              // be a stable key.
              return <div key={idx}>{renderTransaction(transaction)}</div>;
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

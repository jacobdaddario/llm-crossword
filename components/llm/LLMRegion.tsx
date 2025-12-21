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
import { useCrosswordAgent } from "@/hooks/use-crossword-agent";

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
            <Content>{response}</Content>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

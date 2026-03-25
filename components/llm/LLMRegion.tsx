"use client";

import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SparklesIcon } from "lucide-react";

import {
  Agent,
  AgentContent,
  AgentHeader,
  AgentInstructions,
  AgentOutput,
  AgentTool,
  AgentTools,
} from "@/components/ai-elements/agent";
import { AgentToggle } from "@/components/llm/AgentToggle";
import { crosswordAgentToolDefinitions } from "@/components/llm/tools";
import { useCrosswordAgent } from "@/hooks/use-crossword-agent";
import { crosswordAgentInstructions } from "@/hooks/use-crossword-agent/llm-prompts";
import { useEffect, useState } from "react";
import { EmptyState } from "./EmptyState";

export function LLMRegion() {
  const { toggleAgent } = useCrosswordAgent({
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
          className="w-xl max-h-132 flex flex-col overflow-y-auto"
        >
          <div className="relative px-2 pt-4 pb-16">
            <div>
              <EmptyState onClick={() => setRunning(true)} />

              <div className="mt-4">
                <Agent>
                  <AgentHeader name="Crossword Solver" model="gpt-oss:120b" />
                  <AgentContent>
                    <AgentInstructions>{crosswordAgentInstructions}</AgentInstructions>
                    <AgentTools>
                      {crosswordAgentToolDefinitions.map((tool) => (
                        <AgentTool
                          key={tool.name}
                          tool={{
                            description: tool.description,
                            inputSchema: tool.inputSchema,
                          }}
                          value={tool.name}
                        />
                      ))}
                    </AgentTools>
                    <AgentOutput schema="Unstructured text output" />
                  </AgentContent>
                </Agent>
              </div>
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

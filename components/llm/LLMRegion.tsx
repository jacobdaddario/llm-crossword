"use client";

import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useEffect, useState } from "react";
import ollama from "ollama/browser";

import { Thought } from "@/components/llm/Thought";
import { Content } from "@/components/llm/Content";
import { ToolInvocation } from "@/components/llm/ToolInvocation";

export function LLMRegion({}) {
  const [response, setResponse] = useState("");

  // useEffect(() => {
  //   (async () => {
  //     const stream = await ollama.chat({
  //       model: "gpt-oss:20b",
  //       messages: [
  //         {
  //           role: "system",
  //           content:
  //             "Do not use tables or LaTEX notation. The rendrer cannot proces those blocks.",
  //         },
  //         {
  //           role: "user",
  //           content: "Discuss the history of WSJ crossword author, Mike Shenk.",
  //         },
  //       ],
  //       think: "medium",
  //       stream: true,
  //     });
  //
  //     for await (const chunk of stream) {
  //       if (chunk.message.thinking) {
  //         setResponse((prevValue) => {
  //           return prevValue + chunk.message.thinking;
  //         });
  //       }
  //
  //       if (chunk.message.content) {
  //         setResponse((prevValue) => {
  //           return prevValue + chunk.message.content;
  //         });
  //       }
  //     }
  //   })();
  // }, []);

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
            <Thought>This is an LLM doing some thinking. Hrm...</Thought>
            <Content>This is output from an LLM talking to the user</Content>
            <ToolInvocation toolName="Foo Tool">
              {'{ "test": "foo" }'}
            </ToolInvocation>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

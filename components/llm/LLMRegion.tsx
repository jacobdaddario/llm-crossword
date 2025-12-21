"use client";

import { SparklesIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { useEffect, useState } from "react";
import ollama from "ollama/browser";

export function LLMRegion({}) {
  const [response, setResponse] = useState("");

  useEffect(() => {
    (async () => {
      const stream = await ollama.chat({
        model: "gpt-oss:20b",
        messages: [{ role: "user", content: "Explain optimal blackjack play" }],
        think: "medium",
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.message.thinking) {
          setResponse((prevValue) => {
            return prevValue + chunk.message.thinking;
          });
        }

        if (chunk.message.content) {
          setResponse((prevValue) => {
            return prevValue + chunk.message.content;
          });
        }
      }
    })();
  }, []);

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
          className="w-92 max-h-196 flex flex-col-reverse overflow-y-auto"
        >
          <div className="px-2 py-4 font-mono">{response}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

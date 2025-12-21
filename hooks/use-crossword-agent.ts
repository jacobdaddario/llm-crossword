import { useEffect, useState } from "react";
import ollama, { type Message } from "ollama/browser";

type CrosswordAgent = {
  response: AgentTrace;
};

type AgentTransactionTypes = "content" | "thought" | "tool_call";

export type AgentTransaction = {
  type: AgentTransactionTypes;
  text: string;
};

type AgentTrace = AgentTransaction[];

type AvailableModels = "gpt-oss:20b" | "gpt-oss:120b";

const initialMessages: Message[] = [
  {
    role: "system",
    content:
      "Do not use tables or LaTEX notation. The rendrer cannot proces those blocks.",
  },
  {
    role: "user",
    content:
      "Tell me about a different place in the world. Start with anywhere you choose.",
  },
];

function updateTransaction(transaction: AgentTransaction, newChunk: string) {
  return {
    ...transaction,
    text: transaction.text + newChunk,
  };
}

function updateTrace(trace: AgentTrace, newChunk: string) {
  return [...trace.slice(0, -1), updateTransaction(trace.at(-1)!, newChunk)];
}

export function useCrosswordAgent({
  model,
}: {
  model: AvailableModels;
}): CrosswordAgent {
  const [response, setResponse] = useState<AgentTrace>([
    { type: "content", text: "" },
  ]);

  useEffect(() => {
    const messageHistory: Message[] = initialMessages;

    (async () => {
      while (true) {
        const stream = await ollama.chat({
          model: model,
          messages: messageHistory,
          think: "medium",
          stream: true,
        });

        let thinking = "";
        let content = "";
        for await (const chunk of stream) {
          // if (chunk.message.content) {
          setResponse((prevValue) => {
            return updateTrace(
              prevValue,
              chunk.message.thinking || "" + chunk.message.content || "",
            );
          });

          content += chunk.message.content;
          // }
        }
        console.log(messageHistory);
        messageHistory.push(
          { role: "assistant", content, thinking },
          { role: "user", content: "Excellent, tell me about somewhere else." },
        );
      }
    })();
  }, []);

  return { response };
}

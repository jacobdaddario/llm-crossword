import { useEffect, useRef, useState } from "react";
import ollama, { type Message } from "ollama/browser";

type CrosswordAgent = {
  response: AgentTrace;
  toggleAgent: () => void;
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
      "Do not use tables or LaTEX notation. The rendrer cannot proces those blocks. Be brief.",
  },
  {
    role: "user",
    content:
      "Tell me about a different place in the world. Start with anywhere you choose.",
  },
];

// HACK: This might be a really dumb way of doing this, but I don't see any way to synchronously wait
// on the client. GPT suggested this. Seems like clever use of `Promise` to basicaly force `setTimeout`
// to be syncrhonous. There's probably a better way to do this, but it's beyond me, and this is good enough.
async function pollingDelay() {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function updateTransaction(transaction: AgentTransaction, newChunk: string) {
  return {
    ...transaction,
    text: transaction.text + newChunk,
  };
}

function updateTrace(trace: AgentTrace, newChunk: AgentTransaction) {
  const mostRecentTrace = trace.at(-1);

  return mostRecentTrace?.type === newChunk.type
    ? [...trace.slice(0, -1), updateTransaction(mostRecentTrace, newChunk.text)]
    : [...trace, newChunk];
}

export function useCrosswordAgent({
  model,
}: {
  model: AvailableModels;
}): CrosswordAgent {
  const [trace, setTrace] = useState<AgentTrace>([]);
  const runningRef = useRef(false);
  const modelSnapshot = useRef<AvailableModels>(model);

  useEffect(() => {
    const messageHistory: Message[] = initialMessages;

    (async () => {
      while (true) {
        if (!runningRef.current) {
          await pollingDelay();

          continue;
        }

        const stream = await ollama.chat({
          model: modelSnapshot.current,
          messages: messageHistory,
          think: "medium",
          stream: true,
        });

        let aggregatedThinking = "";
        let aggregatedContent = "";

        for await (const chunk of stream) {
          const { thinking, content } = chunk.message;

          if (content) {
            setTrace((prevValue) => {
              return updateTrace(prevValue, {
                text: content,
                type: "content",
              });
            });

            aggregatedContent += content;
          }

          if (thinking) {
            setTrace((prevValue) => {
              return updateTrace(prevValue, {
                text: thinking,
                type: "thought",
              });
            });

            aggregatedThinking += thinking;
          }
        }

        messageHistory.push(
          {
            role: "assistant",
            content: aggregatedContent,
            thinking: aggregatedThinking,
          },
          { role: "user", content: "Excellent, tell me about somewhere else." },
        );
      }
    })();
  }, []);

  return {
    response: trace,
    toggleAgent: () => {
      runningRef.current = !runningRef.current;
    },
  };
}

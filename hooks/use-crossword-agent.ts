import { useEffect, useState } from "react";
import ollama, { type Message } from "ollama/browser";

type CrosswordAgent = {
  response: string;
};

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

export function useCrosswordAgent({
  model,
}: {
  model: AvailableModels;
}): CrosswordAgent {
  const [response, setResponse] = useState("");

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
          if (chunk.message.thinking) {
            setResponse((prevValue) => {
              return prevValue + chunk.message.thinking;
            });

            thinking += chunk.message.thinking;
          }

          if (chunk.message.content) {
            setResponse((prevValue) => {
              return prevValue + chunk.message.content;
            });

            content += chunk.message.content;
          }
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

import { type Context, useContext, useEffect, useRef, useState } from "react";
import ollama, {
  type ToolCall,
  type Message,
  type ChatResponse,
} from "ollama/browser";

import { processToolInvocations, tools } from "@/components/llm/tools";
import {
  GridNumbersContext,
  GridCluesContext,
  GridContext,
  CurrentClueWriterContext,
  AnswersContext,
  GridCorrectnessWriterContext,
} from "@/components/crossword/PuzzleContext";

import type {
  CrosswordClueLists,
  CrosswordGridNumbers,
} from "@/types/crossword.types";

type CrosswordAgent = {
  response: AgentTrace;
  toggleAgent: () => void;
};

type AgentTransactionTypes = "content" | "thought" | "tool_call";

export type AgentTransaction = {
  type: AgentTransactionTypes;
  text: string | ToolCall;
};

type AgentTrace = AgentTransaction[];

type AvailableModels = "gpt-oss:20b" | "gpt-oss:120b";

const repeatedInstructions = `
## Imperatives
- Do not use tables or LaTEX notation.
- Be brief in your turns. Do not try to solve every clue at once.
- Use your tools to modify the crossword state.
- Only use letters to try and solve the puzzle.
- Do _NOT_ attempt to find the puzzle in training data. It's likely you will guess wrong.
- You _MUST_ use the provided tools to solve the puzzle. Do _NOT_ just solve in internal state.
- You _MUST_ solve 1-2 clues at a time. Do _NOT_ ruminate on solving the whole puzzle.

## Workflow
- Select a clue from the list, and focus on that.
- Consider solutions based on the surrounding state.
- Attempt to fill in an answer if possible.
- Otherwise, move to the next clue.
- Typical crossword solving involves filling fact-based clues first, and then using the placed letters to consider possible answsers for vague clues.
`;

const initialMessages: Message[] = [
  {
    role: "system",
    content: `
## Overview
You are a crossword solving agent. Your job is to solve a crossword until completion. Typical crossword rules apply.

${repeatedInstructions}
`,
  },
  {
    role: "user",
    content: "The puzzle is blank. Please begin solving.",
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

  // NOTE: Tool calls all get their own trace.
  return mostRecentTrace?.type !== "tool_call" &&
    mostRecentTrace?.type === newChunk.type
    ? [
        ...trace.slice(0, -1),
        updateTransaction(mostRecentTrace, newChunk.text as string),
      ]
    : [...trace, newChunk];
}

function usePollPuzzleState<T>(context: Context<T>) {
  const observeredState = useContext(context);

  const contextRef = useRef(observeredState);
  // NOTE: Updating the ref on state changes. This allows the agent loop to not have
  // any react dependencies while still having up to date data.
  useEffect(() => {
    contextRef.current = observeredState;
  }, [observeredState]);

  return contextRef;
}

export function useCrosswordAgent({
  model,
}: {
  model: AvailableModels;
}): CrosswordAgent {
  const [trace, setTrace] = useState<AgentTrace>([]);

  const runningRef = useRef(false);
  const gridStateRef = usePollPuzzleState(GridContext);

  const gridNumsSnapshot = useRef<CrosswordGridNumbers>(
    useContext(GridNumbersContext),
  );
  const clueListSnapshot = useRef<CrosswordClueLists>(
    useContext(GridCluesContext),
  );
  const answersSnapshot = useRef(useContext(AnswersContext));
  const setGridCorrectnessSnapshot = useRef(
    useContext(GridCorrectnessWriterContext),
  );
  const currentClueSetterSnapshot = useRef(
    useContext(CurrentClueWriterContext),
  );
  const modelSnapshot = useRef<AvailableModels>(model);

  useEffect(() => {
    const messageHistory: Message[] = initialMessages;

    (async () => {
      while (true) {
        if (!runningRef.current) {
          await pollingDelay();

          continue;
        }

        // NOTE: Due to typing issues in ollama, I can't assign the proper type to this.
        let stream;
        try {
          stream = await ollama.chat({
            model: modelSnapshot.current,
            messages: messageHistory,
            tools: tools,
            think: "low",
            stream: true,
          });
        } catch (error) {
          console.error("Error creating ollama chat stream:", error);
          // Swallow error and continue loop
          continue;
        }

        let aggregatedThinking = "";
        let aggregatedContent = "";
        const aggregatedToolCalls: ToolCall[] = [];

        for await (const chunk of stream) {
          const { thinking, content, tool_calls } = chunk.message;

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

          if (tool_calls) {
            tool_calls.forEach((toolCall) => {
              setTrace((prevValue) => {
                return updateTrace(prevValue, {
                  text: toolCall,
                  type: "tool_call",
                });
              });
            });

            aggregatedToolCalls.push(...tool_calls);
          }
        }

        messageHistory.push(
          {
            role: "assistant",
            content: aggregatedContent,
            thinking: aggregatedThinking,
            tool_calls: aggregatedToolCalls,
          },
          {
            role: "user",
            content: `
${repeatedInstructions}
Continue trying to solve. You have all the time in the world. You can work as long as necessasry.
`,
          },
        );

        messageHistory.push(
          ...processToolInvocations(aggregatedToolCalls, {
            clueList: clueListSnapshot.current,
            gridNums: gridNumsSnapshot.current,
            gridState: gridStateRef.current,
            setCurrentClue: currentClueSetterSnapshot.current,
            answers: answersSnapshot.current,
            setGridCorrectness: setGridCorrectnessSnapshot.current,
          }),
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

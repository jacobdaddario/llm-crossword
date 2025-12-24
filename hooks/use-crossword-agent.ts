import { type Context, useContext, useEffect, useRef, useState } from "react";
import ollama, { type ToolCall, type Message } from "ollama/browser";

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
  toggleAgent: (state: boolean) => void;
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
- Use your tools to modify the crossword state.
- Only use letters to try and solve the puzzle.
- Do _NOT_ attempt to find the puzzle in training data. It's likely you will guess wrong.
- You _MUST_ use the provided tools to solve the puzzle. Do _NOT_ just solve in internal state.
- You _MUST_ solve 1-2 clues at a time. Do _NOT_ ruminate on solving the whole puzzle.
- If you begin reasoning for a long time, say to yourself: "I am not to solve every question at once. Let's move to the next clue."
- Make sure to consider down clues as well as clues on later numbers.
- Do not reply to the user directly. Spend your time considering answers in your chain of thought.

## Workflow
- Select a clue from the list, and focus on that.
- Consider solutions based on the surrounding state.
- Attempt to fill in an answer if possible.
- Otherwise, move to the next clue.
- Prioritize fact-based clues first. Then use their answers to help with vague clues.
- Sometimes when a player feels that they might not be have the correct answer for a square, they will use the check grid tool.
- Tight cycles are essential.
- If you want to give up, consider checking to see what answers are correct.
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

        try {
          const stream = await ollama.chat({
            model: modelSnapshot.current,
            messages: messageHistory,
            tools: tools,
            think: "low",
            stream: true,
            options: {
              num_ctx: 12_276,
              num_predict: 1024,
            },
          });

          let aggregatedThinking = "";
          let aggregatedContent = "";
          const aggregatedToolCalls: ToolCall[] = [];

          for await (const chunk of stream) {
            const { thinking, content, tool_calls } = chunk.message;

            if (chunk.done) {
              console.log(
                `[TELEMETRY] Context Size: ${chunk.prompt_eval_count} tokens`,
              );
            }

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
            ...processToolInvocations(aggregatedToolCalls, {
              clueList: clueListSnapshot.current,
              gridNums: gridNumsSnapshot.current,
              gridState: gridStateRef.current,
              setCurrentClue: currentClueSetterSnapshot.current,
              answers: answersSnapshot.current,
              setGridCorrectness: setGridCorrectnessSnapshot.current,
            }),
            {
              role: "user",
              content: `
  ${repeatedInstructions}
  Continue trying to solve. You have all the time in the world. You can work as long as necesssary. Consider trying clues that haven't been filled yet. Go to lower parts of the list, or try a different direction.
  `,
            },
          );

          // NOTE: As sessions get long, it's important to not blow out the context on my machine
          // or to blue out the state size in React.
          while (messageHistory.length > 20) {
            messageHistory.shift();
          }

          setTrace((prevValue) => {
            if (prevValue.length <= 40) return prevValue;
            return prevValue.toSpliced(0, prevValue.length - 40);
          });
        } catch {
          // Swallow error, let Ollama sort itself out..
          await pollingDelay();
          continue;
        }
      }
    })();
    // NOTE: In practice, this is a dependency-free effect. This will _never_ trigger a re-run. It is a
    // totally stable value, as it is a ref. This is still a long-running effect that will never
    // re-run, since its only dependency is stable. The react-hooks eslint rule is unable to discern
    // that due to the use of a custom hook. I've opted to _not_ ignore the rule though so that I can
    // continue to be guarded against accidentally enclosing state in this effect. That would be
    // bad because either I'd be violating the exhaustive deps model (and obviously have stale state)
    // or I would have to add it to this list, breaking the long-running effect model.
  }, [gridStateRef]);

  return {
    response: trace,
    toggleAgent: (state: boolean) => {
      runningRef.current = state;
    },
  };
}

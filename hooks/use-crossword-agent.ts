import ollama, { type Message, type ToolCall } from "ollama/browser";
import {
  type Context,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";

import {
  AnswersContext,
  CurrentClueWriterContext,
  GridCluesContext,
  GridContext,
  GridCorrectnessWriterContext,
  GridNumbersContext,
  GridWriterContext,
} from "@/components/crossword/PuzzleContext";
import { type ToolEvaluation, invokeTool, tools } from "@/components/llm/tools";

import type {
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import {
  agentLoopMessage,
  initialMessages,
  listAllClues,
  puzzleState,
} from "./use-crossword-agent/llm-prompts";
import {
  type AgentTrace,
  traceReducer,
} from "./use-crossword-agent/trace-reducer";

type CrosswordAgent = {
  response: AgentTrace;
  toggleAgent: (state: boolean) => void;
};

type AvailableModels = "gpt-oss:20b" | "gpt-oss:120b";

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
  const [trace, dispatchTrace] = useReducer(traceReducer, []);
  const runningRef = useRef(false);

  const gridStateRef = usePollPuzzleState(GridContext);
  const setGridStateSnapshot = useRef<Dispatch<SetStateAction<CrosswordGrid>>>(
    useContext(GridWriterContext),
  );
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
  const messageHistoryRef = useRef<Message[]>(initialMessages);

  useEffect(() => {
    const messageHistory: Message[] = initialMessages;
    messageHistory.push(
      puzzleState(gridStateRef.current, gridNumsSnapshot.current),
    );
    messageHistory.push(listAllClues(clueListSnapshot.current));

    let tokenCount = 0;

    (async () => {
      while (true) {
        const messageHistory = messageHistoryRef.current.toSpliced(
          0,
          messageHistoryRef.current.length - 20,
        );

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
          const aggregatedToolEvalutions: ToolEvaluation[] = [];

          for await (const chunk of stream) {
            const { thinking, content, tool_calls } = chunk.message;

            if (chunk.done) {
              tokenCount += chunk.prompt_eval_count;

              console.log(
                `[TELEMETRY] Context Size: ${chunk.prompt_eval_count} tokens`,
                `\n[TELEMETRY] Total tokens this run: ${tokenCount} tokens`,
              );
            }

            if (content) {
              dispatchTrace({ type: "append_content", text: content });

              aggregatedContent += content;
            }

            if (thinking) {
              dispatchTrace({ type: "append_thinking", text: thinking });

              aggregatedThinking += thinking;
            }

            if (tool_calls) {
              tool_calls.forEach((toolCall) => {
                const toolEvaluation = invokeTool(toolCall, {
                  clueList: clueListSnapshot.current,
                  gridNums: gridNumsSnapshot.current,
                  gridState: gridStateRef.current,
                  setGridState: setGridStateSnapshot.current,
                  setCurrentClue: currentClueSetterSnapshot.current,
                  answers: answersSnapshot.current,
                  setGridCorrectness: setGridCorrectnessSnapshot.current,
                });
                aggregatedToolEvalutions.push(toolEvaluation);

                dispatchTrace({
                  type: "append_tool_call",
                  toolCall,
                  toolEvaluation,
                });
              });

              aggregatedToolCalls.push(...tool_calls);
            }
          }

          messageHistoryRef.current.push(
            {
              role: "assistant",
              content: aggregatedContent,
              thinking: aggregatedThinking,
              tool_calls: aggregatedToolCalls,
            },
            ...aggregatedToolEvalutions.map<Message>((evaluation) => {
              return {
                role: "tool",
                ...evaluation,
              };
            }),
            agentLoopMessage,
            puzzleState(gridStateRef.current, gridNumsSnapshot.current),
          );

          dispatchTrace({ type: "truncate" });
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

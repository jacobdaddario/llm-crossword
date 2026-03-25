import { generateText, stepCountIs, type ModelMessage } from "ai";
import { ollama } from "ai-sdk-ollama";
import {
  type Context,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
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
import { createCrosswordTools } from "@/components/llm/tools";

import type {
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import {
  agentLoopMessage,
  initialMessages,
} from "./use-crossword-agent/llm-prompts";

type CrosswordAgent = {
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
  const messageHistoryRef = useRef<ModelMessage[]>(initialMessages);

  useEffect(() => {
    let tokenCount = 0;
    let cancelled = false;

    (async () => {
      while (!cancelled) {
        const messageHistory = messageHistoryRef.current.toSpliced(
          0,
          messageHistoryRef.current.length - 20,
        );

        if (!runningRef.current) {
          await pollingDelay();

          continue;
        }

        try {
          const response = await generateText({
            model: ollama(modelSnapshot.current, {
              think: "low",
              options: {
                num_ctx: 12_276,
                num_predict: 1024,
              },
            }),
            messages: messageHistory,
            tools: createCrosswordTools({
              clueList: clueListSnapshot.current,
              gridNums: gridNumsSnapshot.current,
              gridState: gridStateRef.current,
              setGridState: setGridStateSnapshot.current,
              setCurrentClue: currentClueSetterSnapshot.current,
              answers: answersSnapshot.current,
              setGridCorrectness: setGridCorrectnessSnapshot.current,
            }),
            stopWhen: stepCountIs(20),
          });

          tokenCount += response.totalUsage.inputTokens ?? 0;

          console.log(
            `[TELEMETRY] Context Size: ${response.usage.inputTokens} tokens`,
            `\n[TELEMETRY] Total tokens this run: ${tokenCount} tokens`,
          );

          messageHistoryRef.current.push(...response.response.messages, agentLoopMessage);
        } catch {
          // Swallow error, let Ollama sort itself out..
          await pollingDelay();
          continue;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // NOTE: In practice, this is a dependency-free effect. This will _never_ trigger a re-run. It is a
    // totally stable value, as it is a ref. This is still a long-running effect that will never
    // re-run, since its only dependency is stable. The react-hooks eslint rule is unable to discern
    // that due to the use of a custom hook. I've opted to _not_ ignore the rule though so that I can
    // continue to be guarded against accidentally enclosing state in this effect. That would be
    // bad because either I'd be violating the exhaustive deps model (and obviously have stale state)
    // or I would have to add it to this list, breaking the long-running effect model.
  }, [gridStateRef]);

  return {
    toggleAgent: (state: boolean) => {
      runningRef.current = state;
    },
  };
}

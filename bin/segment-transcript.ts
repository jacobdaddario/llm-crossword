import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import type { Message, ToolCall } from "ollama/browser";
import { parseArgs } from "util";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

type AgentSegmentType =
  | "task_orientation"
  | "rumination"
  | "counting_squares"
  | "clue_scanning"
  | "candidate_generation"
  | "candidate_filtering"
  | "cross_checking"
  | "tool_selection"
  | "tool_invocation"
  | "progress_assessment"
  | "conflict_detection"
  | "backtracking"
  | "strategy_shift"
  | "deadline_awareness"
  | "termination_claim";

type MessageSegments = {
  segmentType: AgentSegmentType;
  segmentContent: string;
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: "string",
    },
  },
  allowPositionals: true,
  strict: true,
});

const transcript: Message[] = JSON.parse(
  await readFile(`${cwd()}/experiments/${values.input}`, {
    encoding: "utf8",
  }),
);

const combinedTranscript: string = transcript
  .map(({ role, content, thinking, tool_calls }): string => {
    if (role !== "assistant") return "";

    return (
      content +
      " " +
      thinking +
      "\n" +
      tool_calls!
        .map((toolCall) => `Calling ${toolCall.function.name}.`)
        .join("\n")
    );
  })
  .join("\n");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 30,
  chunkOverlap: 0,
});
const segments = await splitter.splitText(combinedTranscript);

console.log(segments);

import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import type { Message } from "ollama/browser";
import { parseArgs } from "util";

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
});

const transcript: Message[] = JSON.parse(
  await readFile(`${cwd()}/experiments/${values.input}`, {
    encoding: "utf8",
  }),
);

const transcriptSegements: MessageSegments[];

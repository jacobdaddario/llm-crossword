import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile, writeFile } from "node:fs/promises";
import { cwd } from "node:process";
import type { Message } from "ollama/browser";
import ollama from "ollama/browser";
import { parseArgs } from "util";

enum AgentSegmentType {
  CountingSquares = "counting_squares",
  CandidateGeneration = "candidate_generation",
  CandidateFiltering = "candidate_filtering",
  ProgressAssessment = "progress_assessment",
  CheckingAnswer = "checking_answer",
  ConflictDetection = "conflict_detection",
  StrategyShift = "strategy_shift",
  ToolSelection = "tool_selection",
  ToolInvocation = "tool_invocation",
  TaskOrientation = "task_orientation",
  CrossChecking = "cross_checking",
  DeadlineAwareness = "deadline_awareness",
  TerminationClaim = "termination_claim",
  Undetermined = "undetermined",
}

type MessageSegments = {
  segmentType: AgentSegmentType;
  segmentContent: string;
};

const SYSTEM_MESSAGE = `
You are a text classifier. The user will feed you sections of a transript, and you job is to classify the chunks in one of the following categories:
${Object.values(AgentSegmentType).join(" ")}

Sample transcripts

We need fill.

task_orientation

col3 length until black at col7? row4 col3-6 four

counting_squares

is first name of actress \"Pia\" who? \"Pia Zadora\"

candidate_generation

P N P S, need U M? Actually letters should be

candidate_filtering
`;

const isAgentSegmentType = (value: string): value is AgentSegmentType => {
  return Object.values(AgentSegmentType).includes(value as AgentSegmentType);
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    input: {
      type: "string",
    },
    output: {
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
  chunkSize: 100,
  chunkOverlap: 0,
});
const segments = await splitter.splitText(combinedTranscript);

const segmentedTranscript = await Promise.all(
  segments.map<Promise<MessageSegments>>(async (segment) => {
    const category = await ollama.chat({
      model: "gemma3:4b",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: segment },
      ],
    });
    const categoryContent = category.message.content.trim();

    console.log({ segmentType: categoryContent, segmentContent: segment });

    if (isAgentSegmentType(categoryContent)) {
      return { segmentType: categoryContent, segmentContent: segment };
    } else {
      return {
        segmentType: AgentSegmentType.Undetermined,
        segmentContent: segment,
      };
    }
  }),
);

await writeFile(
  `${cwd}/experiments/segmented-transcripts/${values.output}.json`,
  JSON.stringify(segmentedTranscript),
);

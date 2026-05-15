import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile, writeFile } from "node:fs/promises";
import { cwd } from "node:process";
import type { Message } from "ollama/browser";
import ollama from "ollama/browser";
import { parseArgs } from "util";

enum AgentSegmentType {
  CountingSquares = "counting_squares",
  CandidateAssessment = "candidate_assessment",
  ConflictDetection = "conflict_detection",
  ProgressAssessment = "progress_assessment",
  StrategyShift = "strategy_shift",
  TaskOrientation = "task_orientation",
  Undetermined = "undetermined",
}

type MessageSegments = {
  segmentType: AgentSegmentType;
  segmentContent: string;
};

const SYSTEM_MESSAGE = `
You are a text classifier. The user will feed you sections of a transript, and you job is to classify the chunks in one of the following categories:
${Object.values(AgentSegmentType).join(" ")}

It is imperative that you only answer with one of those words. If a segment doesn't clearly match one of the categories, defer to "undertermined".

Sample transcript:
We need fill.

${AgentSegmentType.TaskOrientation}

col9 is #? row5 col9 is \".\" yes block. col10 start A27 length? row5 col10-? row5 col10-14 five letters then col15 #? actually row5 col15 is #? row5

${AgentSegmentType.CountingSquares}

Row4 col12 start across 22 length row4 col12 ?,13?,14?,15? until end row4 length4 clue Big word in advertising = \"SALE\"? maybe \"FREE\". leave."

${AgentSegmentType.CandidateAssessment}

14 across (NORA). Maybe NORA wrong? clue 14 across: Edgar-winning writer Larson. That's \"Nora\" indeed. But that gives N at row2 col1 interfering.

${AgentSegmentType.ConflictDetection}
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
  chunkSize: 150,
  chunkOverlap: 0,
});
const segments = await splitter.splitText(combinedTranscript);

const segmentedTranscript = await segments.reduce<Promise<MessageSegments[]>>(
  async (segmentedTranscriptsPromise, segment) => {
    const segmentedTranscripts = await segmentedTranscriptsPromise;

    const category = await ollama.chat({
      model: "gemma3:12b",
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        ...segmentedTranscripts.slice(-3).flatMap((segment) => [
          { role: "user", content: segment.segmentContent },
          { role: "assistant", content: segment.segmentType },
        ]),
        { role: "user", content: segment },
      ],
    });
    const categoryContent = category.message.content.trim();

    console.log({ segmentType: categoryContent, segmentContent: segment });

    if (isAgentSegmentType(categoryContent)) {
      return [
        ...segmentedTranscripts,
        { segmentType: categoryContent, segmentContent: segment },
      ];
    } else {
      return [
        ...segmentedTranscripts,
        {
          segmentType: AgentSegmentType.Undetermined,
          segmentContent: segment,
        },
      ];
    }
  },
  Promise.resolve([]),
);

await writeFile(
  `${cwd()}/experiments/segmented-transcripts/${values.output}.json`,
  JSON.stringify(segmentedTranscript),
);

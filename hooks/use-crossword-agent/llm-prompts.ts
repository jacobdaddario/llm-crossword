import { prettyPrintRows } from "@/components/llm/tools";
import type {
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import { chunk, zip } from "lodash";
import type { Message } from "ollama/browser";

const repeatedInstructions = `
Objective:
You are an autonomous agent. Continue working on the crossword until it is complete. Do not ask for user input. Document assumptions you make.

Rules:
- Do not use tables or LaTEX notation.
- Only use letters to try and solve the puzzle.
- Do _NOT_ attempt to find the puzzle in training data.
- Use the provided tools to solve the puzzle. Do _NOT_ just solve in internal state.
- Solve 1-2 clues at a time. Do _NOT_ think extensively in an effort to solve the whole puzzle.
- Consider down clues as well as clues on later numbers.
- Do not reply to the user directly. Spend your time considering answers in your chain of thought.

Exeuction loop:
1. Select a clue from the list, and focus on that. State that you are solving that clue.
2. Consider solutions based on the surrounding puzzle state.
3. Attempt to fill in an answer if possible.
4. Otherwise, move to the next clue.
5. Prioritize fact-based clues first. Then use their answers to help with vague clues.
6. Use the check grid tool if uncertain about an answer's correctness.

Termination:
When every square in the check_puzzle tool output is true or undefined, the puzzle is correct. You may then state that the puzzle is solved.
`;

export const initialMessages: Message[] = [
  {
    role: "system",
    content: `
You are a crossword solving agent. Your job is to solve a crossword until completion. Typical crossword rules apply.

${repeatedInstructions}
`,
  },
  {
    role: "user",
    content: "The puzzle is blank. Please begin solving.",
  },
];

export const agentLoopMessage: Message = {
  role: "user",
  content: `
  ${repeatedInstructions}
  `,
};

export function puzzleState(
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
): Message {
  const gridLength = Math.sqrt(gridState.length);
  const numberStatePair = zip(gridNumbers, gridState);

  const chunkedGridState = chunk(numberStatePair, gridLength);

  return {
    role: "user",
    content: prettyPrintRows(chunkedGridState),
  };
}

export const listAllClues = (clues: CrosswordClueLists) => {
  // NOTE: I'm intentionally performing a mutation in place on the ref to the clue list here.
  // I _don't_ want this to trigger a re-render. I only want it to change what
  // the LLM sees internally when making a decision. Therefore, the ref is the right
  // thing to change here. Additionally, inplace mutations on refs are both allowed and
  // expedient here so that I don't have to pass the ref itself, just its value.
  const unshiftedList = {
    across: [...clues.across],
    down: [...clues.down],
  };

  let first = clues.across.shift();
  clues.across.push(first as string);

  first = clues.down.shift();
  clues.down.push(first as string);

  return {
    role: "user",
    content: JSON.stringify(unshiftedList, null, 2),
  };
};

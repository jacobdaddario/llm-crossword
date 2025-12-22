import {
  CrosswordClueDirection,
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridCell,
  CrosswordGridNumber,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import { zip } from "lodash";
import { Message, Tool, ToolCall } from "ollama/browser";

import type { CurrentClueIndex } from "@/components/crossword/PuzzleContext";
import { Dispatch, SetStateAction } from "react";

type AgentState = {
  clueList: CrosswordClueLists;
  gridNums: CrosswordGridNumbers;
  gridState: CrosswordGrid;
  currentClue: CurrentClueIndex;
  setCurrentClue: Dispatch<SetStateAction<CurrentClueIndex>>;
  answers: CrosswordGrid;
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>;
};

export type ToolInvocationMessage = Message & {
  role: "tool";
  tool_name: string;
  content: string;
};

export const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "read_board_state",
      description:
        "Read the entire state of the board. This shows current answers and hint numbers. `0` indicates no number. `.` indicates a black square.",
    },
  },
  {
    type: "function",
    function: {
      name: "list_all_clues",
      description:
        "List all clues in the puzzle, along with their clue numbers.",
    },
  },
  {
    type: "function",
    function: {
      name: "fill_clue",
      description:
        "Fill in the targeted clue with the returned answer. Answer must contain only letters, and it must fit in the length of the clue.",
      parameters: {
        type: "object",
        required: ["answer"],
        properties: {
          direction: {
            type: "string",
            description: "The direction of the clue",
            enum: ["across", "down"],
          },
          clue_number: {
            type: "integer",
            description:
              "The numerical identifier, from the puzzle list, of the clue",
          },
          answer: {
            type: "string",
            description:
              "The guessed answer to the clue. Must fit in the spaces available. Will overwrite the current content of the spaces.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_puzzle",
      description: "Checkes the entire completed crossword grid.",
    },
  },
];

const read_board_state = (
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
): [CrosswordGridNumber | undefined, CrosswordGridCell | undefined][] => {
  return zip(gridNumbers, gridState);
};

const list_all_clues = (clues: CrosswordClueLists) => {
  return clues;
};

const fill_clue = (
  setCurrentClue: Dispatch<SetStateAction<CurrentClueIndex>>,
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
  clueList: CrosswordClueLists,
  direction: CrosswordClueDirection,
  clue_number: number,
  answer: string,
) => {
  const currentClueArrayIndex = clueList[direction].findIndex((clue) =>
    // NOTE: I am making an assumption that the model will inconsistenly
    // return a period. If it doesn't I want to check for one to prevent
    // false positive matches.
    clue.match(new RegExp(`\A${clue_number}\.?`)),
  );

  setCurrentClue({ direction, arrayIndex: currentClueArrayIndex });

  const gridWithNumbers = zip(gridNumbers, gridState);
  const startingSquareIndex = gridWithNumbers.findIndex(
    (square) => square[0] === clue_number,
  );

  const gridLength = Math.sqrt(gridState.length);

  const splitAnswer = answer.split("").map((char) => char.toUpperCase());
  const jumpSize = direction === "across" ? 1 : gridLength;

  let index = startingSquareIndex;
  splitAnswer.forEach((char) => {
    gridState[index] = char;

    index += jumpSize;
  });
};

const check_puzzle = (
  gridState: CrosswordGrid,
  answers: CrosswordGrid,
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>,
): (boolean | undefined)[] => {
  const gridCorrectness = Array(answers.length);

  gridState.forEach((cellValue, idx) => {
    if (answers[idx] === ".") {
      gridCorrectness[idx] = undefined;
    } else {
      gridCorrectness[idx] = cellValue === answers[idx]?.toLowerCase();
    }
  });

  setGridCorrectness(gridCorrectness);

  return gridCorrectness;
};

export const processToolInvocations = (
  toolCalls: ToolCall[],
  {
    clueList,
    gridNums,
    gridState,
    currentClue,
    setCurrentClue,
    answers,
    setGridCorrectness,
  }: AgentState,
): ToolInvocationMessage[] => {
  const results: ToolInvocationMessage[] = [];

  toolCalls.forEach((toolCall) => {
    const pushToolResult = (content: string) => {
      results.push({
        role: "tool",
        tool_name: toolCall.function.name,
        content,
      });
    };

    switch (toolCall.function.name) {
      case "read_board_state":
        pushToolResult(
          JSON.stringify(read_board_state(gridState, gridNums), null, 2),
        );
        debugger;
        break;
      case "list_all_clues":
        pushToolResult(JSON.stringify(list_all_clues(clueList), null, 2));
        break;
      case "check_puzzle":
        pushToolResult(
          JSON.stringify(
            check_puzzle(gridState, answers, setGridCorrectness),
            null,
            2,
          ),
        );
        break;
      default:
        pushToolResult("Unknown tool call");
        break;
    }
  });

  return results;
};

// NOTE: Hacky, but don't know where to put this function where both files can consume it.
// Chose to alias it to get rid of snakecase.
export const checkPuzzle = check_puzzle;

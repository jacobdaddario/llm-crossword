import {
  CrosswordClueDirection,
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridCell,
  CrosswordGridNumber,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import { chunk, zip } from "lodash";
import { Tool, ToolCall } from "ollama/browser";

import type { CurrentClueIndex } from "@/components/crossword/PuzzleContext";
import { Dispatch, SetStateAction } from "react";

type AgentState = {
  clueList: CrosswordClueLists;
  gridNums: CrosswordGridNumbers;
  gridState: CrosswordGrid;
  setCurrentClue: Dispatch<SetStateAction<CurrentClueIndex>>;
  answers: CrosswordGrid;
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>;
};

export type ToolEvaluation = {
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
      description: "Checks the entire completed crossword grid.",
    },
  },
];

const prettyPrintRows = <T>(rows: T[][]): string => {
  return (
    `[` +
    rows
      .map((row, i) => {
        const rowJson = JSON.stringify(row);

        const prefix = "\n";
        const suffix = i === rows.length - 1 ? "\n" : ",";

        return prefix + rowJson + suffix;
      })
      .join("") +
    `]`
  );
};

const read_board_state = (
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
): [CrosswordGridNumber | undefined, CrosswordGridCell | undefined][][] => {
  const gridLength = Math.sqrt(gridState.length);
  const numberStatePair = zip(gridNumbers, gridState);

  return chunk(numberStatePair, gridLength);
};

const list_all_clues = (clues: CrosswordClueLists) => {
  return clues;
};

const fill_clue = (
  setCurrentClue: Dispatch<SetStateAction<CurrentClueIndex>>,
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>,
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
  clueList: CrosswordClueLists,
  direction: CrosswordClueDirection,
  clue_number: number,
  answer: string,
): string => {
  try {
    const currentClueArrayIndex = clueList[direction].findIndex((clue) => {
      // NOTE: I am making an assumption that the model will inconsistenly
      // return a period. If it doesn't I want to check for one to prevent
      // false positive matches.
      const clueRegex = new RegExp(`${clue_number}\.?`);

      return clueRegex.test(clue);
    });

    setCurrentClue({ direction, arrayIndex: currentClueArrayIndex });
    setGridCorrectness(Array(gridState.length ** 2).fill(undefined));

    const gridWithNumbers = zip(gridNumbers, gridState);
    const startingSquareIndex = gridWithNumbers.findIndex(
      (square) => square[0] === clue_number,
    );

    const gridLength = Math.sqrt(gridState.length);

    const splitAnswer = answer.split("").map((char) => char.toUpperCase());
    const jumpSize = direction === "across" ? 1 : gridLength;

    let index = startingSquareIndex;
    splitAnswer.forEach((char) => {
      if (gridState[index] === ".") {
        return "Answer too long. Failed to write full answer. Partially persisted.";
      }

      gridState[index] = char;

      index += jumpSize;
    });
  } catch {
    return "Failed to use tool successfully. Reconsider your inputs relative to tool definitions, and try again.";
  }

  return "Answer successfully written.";
};

const check_puzzle = (
  gridState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
  answers: CrosswordGrid,
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>,
): [
  CrosswordGridNumber | undefined,
  CrosswordGridCell | undefined,
  boolean | undefined,
][][] => {
  const gridCorrectness = Array(answers.length);

  gridState.forEach((cellValue, idx) => {
    if (answers[idx] === ".") {
      gridCorrectness[idx] = undefined;
    } else {
      gridCorrectness[idx] =
        cellValue.toLowerCase() === answers[idx]?.toLowerCase();
    }
  });

  setGridCorrectness(gridCorrectness);

  const gridCorrectnessVisualization = zip(
    gridNumbers,
    gridState,
    gridCorrectness,
  );
  const gridLength = Math.sqrt(gridState.length);

  return chunk(gridCorrectnessVisualization, gridLength);
};

export const invokeTool = (
  toolCall: ToolCall,
  {
    clueList,
    gridNums,
    gridState,
    setCurrentClue,
    answers,
    setGridCorrectness,
  }: AgentState,
): ToolEvaluation => {
  const buildEvaluation = (content: string): ToolEvaluation => {
    return {
      content: content,
      tool_name: toolCall.function.name,
    };
  };

  switch (toolCall.function.name) {
    case "read_board_state": {
      const board = read_board_state(gridState, gridNums);
      const formatted = prettyPrintRows(board);

      return buildEvaluation(formatted);
    }
    case "list_all_clues":
      return buildEvaluation(JSON.stringify(list_all_clues(clueList), null, 2));
    case "fill_clue": {
      const { direction, clue_number, answer } = toolCall.function.arguments;

      const result = fill_clue(
        setCurrentClue,
        setGridCorrectness,
        gridState,
        gridNums,
        clueList,
        direction as CrosswordClueDirection,
        clue_number,
        answer,
      );

      return buildEvaluation(result);
    }
    case "check_puzzle": {
      const grid = check_puzzle(
        gridState,
        gridNums,
        answers,
        setGridCorrectness,
      );
      const formatted = prettyPrintRows(grid);

      return buildEvaluation(formatted);
    }
    default:
      return buildEvaluation("Unknown tool call");
  }
};

// NOTE: Hacky, but don't know where to put this function where both files can consume it.
// Chose to alias it to get rid of snakecase.
export const checkPuzzle = check_puzzle;

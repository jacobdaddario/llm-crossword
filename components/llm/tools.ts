import {
  CrosswordClueLists,
  CrosswordGrid,
  CrosswordGridCell,
  CrosswordGridNumber,
  CrosswordGridNumbers,
} from "@/types/crossword.types";
import { zip } from "lodash";
import { Message, Tool, ToolCall } from "ollama/browser";

type AgentState = {
  clueList: CrosswordClueLists;
  gridNums: CrosswordGridNumbers;
  gridState: CrosswordGrid;
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
      name: "read_current_clue",
      description: "Get the current clue text and number.",
    },
  },
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
      name: "jump_to_clue",
      description: "Change the current clue to a specified clue",
      parameters: {
        type: "object",
        required: ["direction", "clue_number"],
        properties: {
          direction: {
            type: "string",
            description: "The direction of the clue",
            enum: ["across", "down"],
          },
          clue_number: {
            type: "integer",
            description: "The numerical identifier of the clue",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fill_current_clue",
      description:
        "Fill in the current clue with the returned answer. Answer must contain only letters, and it must fit in the length of the clue.",
      parameters: {
        type: "object",
        required: ["answer"],
        properties: {
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

const read_current_clue = () => {};

const read_board_state = (
  boardState: CrosswordGrid,
  gridNumbers: CrosswordGridNumbers,
): [CrosswordGridNumber | undefined, CrosswordGridCell | undefined][] => {
  return zip(gridNumbers, boardState);
};

const list_all_clues = (clues: CrosswordClueLists) => {
  return clues;
};

const jump_to_clue = () => {};

const fill_current_clue = () => {};

const check_puzzle = () => {};

export const processToolInvocations = (
  toolCalls: ToolCall[],
  { clueList, gridNums, gridState }: AgentState,
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
      default:
        pushToolResult("Unknown tool call");
        break;
    }
  });

  return results;
};

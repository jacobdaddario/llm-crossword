import { Tool } from "ollama/browser";

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

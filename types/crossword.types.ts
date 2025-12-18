export type CrosswordClueDirection = "across" | "down";

export type CrosswordAnswer = string;

export type CrosswordAnswerLists = {
  across: CrosswordAnswer[];
  down: CrosswordAnswer[];
};

export type CrosswordClueText = string;

export type CrosswordClueLists = {
  across: CrosswordClueText[];
  down: CrosswordClueText[];
};

// Single letter or "." for black
export type CrosswordGridCell = string;

export type CrosswordGrid = CrosswordGridCell[];

// "0" indicates no number
export type CrosswordGridNumber = number;

export type CrosswordGridNumbers = CrosswordGridNumber[];

export type CrosswordSize = {
  cols: number;
  rows: number;
};

export type CrosswordMeta = {
  author: string;
  copyright: string;
  date: string;
  dow:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  editor: string;
  publisher: string;
  title: string;
};

// Core structure needed for rendering and filling the puzzle
export type CrosswordCore = {
  answers: CrosswordAnswerLists;
  clues: CrosswordClueLists;
  grid: CrosswordGrid;
  gridnums: CrosswordGridNumbers;
  size: CrosswordSize;
};

export type Crossword = CrosswordCore & CrosswordMeta;

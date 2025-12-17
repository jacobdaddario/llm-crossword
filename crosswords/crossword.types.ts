export type CrosswordSize = {
  cols: number;
  rows: number;
};

export type CrosswordClueDirection = "across" | "down";

export type CrosswordClueText = string;

export type CrosswordClueList = CrosswordClueText[];

export type CrosswordClueLists = {
  across: CrosswordClueList;
  down: CrosswordClueList;
};

export type CrosswordAnswer = string;

export type CrosswordAnswerList = CrosswordAnswer[];

export type CrosswordAnswerLists = {
  across: CrosswordAnswerList;
  down: CrosswordAnswerList;
};

export type CrosswordGridCell = string; // single letter or "." for black

export type CrosswordGrid = CrosswordGridCell[];

export type CrosswordGridNumber = number; // 0 = no clue starts here

export type CrosswordGridNumbers = CrosswordGridNumber[];

export type CrosswordMeta = {
  author: string;
  copyright: string;
  date: string; // e.g. "12/1/2008"
  dow: string; // e.g. "Monday"
  editor: string;
  publisher: string;
  title: string;
};

// Core structure needed for rendering and filling the puzzle
export type CrosswordCore = {
  admin: boolean;
  answers: CrosswordAnswerLists;
  clues: CrosswordClueLists;
  grid: CrosswordGrid;
  gridnums: CrosswordGridNumbers;
  size: CrosswordSize;
} & CrosswordMeta;

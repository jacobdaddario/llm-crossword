"use client";

import { Crossword } from "@/types/crossword.types";
import { Puzzle } from "./Puzzle";

type PuzzleFrameParams = {
  puzzleDef: Crossword;
};

export function PuzzleFrame({ puzzleDef }: PuzzleFrameParams) {
  return (
    <div className="flex flex-col mx-auto max-w-min mt-12">
      <div className="mb-4">
        <h1 className="font-serif font-semibold">
          <em>{puzzleDef.title}</em>
        </h1>
        <p className="font-serif text-sm">
          By <em>{puzzleDef.author}</em> - <time>{puzzleDef.date}</time>
        </p>
      </div>
      <Puzzle
        grid={puzzleDef.grid}
        numbers={puzzleDef.gridnums}
        dimension={puzzleDef.size}
      />
    </div>
  );
}

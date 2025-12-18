"use client";

import {
  useState,
  createContext,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Actions } from "./Actions";
import { ClueList } from "./ClueList";
import { PuzzleFrame } from "./PuzzleFrame";

import type { Crossword, CrosswordGrid } from "@/types/crossword.types";

type PuzzleContextParams = {
  puzzleDef: Crossword;
};

export const GridContext = createContext<CrosswordGrid>([]);

export const GridWriterContext = createContext<
  Dispatch<SetStateAction<CrosswordGrid>>
>(() => {});

export const GridCorrectnessContext = createContext<(boolean | undefined)[]>(
  [],
);

export const GridCorrectnessWriterContext = createContext<
  Dispatch<SetStateAction<(boolean | undefined)[]>>
>(() => {});

export function PuzzleContext({ puzzleDef }: PuzzleContextParams) {
  const gridLength = puzzleDef.grid.length;
  const [gridState, setGridState] = useState<CrosswordGrid>(
    Array(gridLength).fill(""),
  );
  const [gridCorrectness, setGridCorrectness] = useState<
    (boolean | undefined)[]
  >(Array(gridLength));

  return (
    <div className="flex justify-center space-x-16 w-full max-h-min">
      <div className="p-2 shrink-0">
        <GridContext value={gridState}>
          <GridWriterContext value={setGridState}>
            <GridCorrectnessContext value={gridCorrectness}>
              <GridCorrectnessWriterContext value={setGridCorrectness}>
                <PuzzleFrame puzzleDef={puzzleDef} />
                <Actions answers={puzzleDef.grid} />
              </GridCorrectnessWriterContext>
            </GridCorrectnessContext>
          </GridWriterContext>
        </GridContext>
      </div>
      <div className="flex mt-28 space-x-6">
        <ClueList direction="across" clues={puzzleDef.clues.across} />
        <ClueList direction="down" clues={puzzleDef.clues.down} />
      </div>
    </div>
  );
}

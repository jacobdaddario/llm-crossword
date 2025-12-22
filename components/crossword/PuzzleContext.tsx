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
import { LLMRegion } from "@/components/llm/LLMRegion";

import type {
  CrosswordClueLists,
  CrosswordClueDirection,
  Crossword,
  CrosswordGrid,
  CrosswordGridNumbers,
} from "@/types/crossword.types";

export type PuzzleContextParams = {
  puzzleDef: Crossword;
};

export type CurrentClueIndex = {
  direction: CrosswordClueDirection;
  arrayIndex: number;
};

export const GridContext = createContext<CrosswordGrid>([]);

export const GridWriterContext = createContext<
  Dispatch<SetStateAction<CrosswordGrid>>
>(() => {});

export const GridCorrectnessContext = createContext<(boolean | undefined)[]>(
  [],
);

export const GridCluesContext = createContext<CrosswordClueLists>({
  across: [],
  down: [],
});

export const GridNumbersContext = createContext<CrosswordGridNumbers>([]);

export const GridCorrectnessWriterContext = createContext<
  Dispatch<SetStateAction<(boolean | undefined)[]>>
>(() => {});
export const CurrentClueContext = createContext<CurrentClueIndex>(null!);

export const CurrentClueWriterContext = createContext<
  Dispatch<SetStateAction<CurrentClueIndex>>
>(() => {});

export const AnswersContext = createContext<CrosswordGrid>([]);

export function PuzzleContext({ puzzleDef }: PuzzleContextParams) {
  const gridLength = puzzleDef.grid.length;
  const [currentClue, setCurrentClue] = useState<CurrentClueIndex>({
    direction: "across",
    arrayIndex: 0,
  });
  const [gridState, setGridState] = useState<CrosswordGrid>(
    puzzleDef.grid.slice().map((value) => (value === "." ? "." : "")),
  );
  const [gridCorrectness, setGridCorrectness] = useState<
    (boolean | undefined)[]
  >(Array(gridLength));

  return (
    <GridNumbersContext value={puzzleDef.gridnums}>
      <GridCluesContext value={puzzleDef.clues}>
        <GridContext value={gridState}>
          <GridWriterContext value={setGridState}>
            <GridCorrectnessContext value={gridCorrectness}>
              <GridCorrectnessWriterContext value={setGridCorrectness}>
                <CurrentClueContext value={currentClue}>
                  <CurrentClueWriterContext value={setCurrentClue}>
                    <AnswersContext value={puzzleDef.grid}>
                      <div className="flex justify-center space-x-16 w-full max-h-min">
                        <div className="p-2 shrink-0">
                          <PuzzleFrame puzzleDef={puzzleDef} />
                          <Actions />
                        </div>
                        <div className="flex mt-28 space-x-6">
                          <ClueList
                            direction="across"
                            clues={puzzleDef.clues.across}
                          />
                          <ClueList
                            direction="down"
                            clues={puzzleDef.clues.down}
                          />
                        </div>
                      </div>
                      <LLMRegion />
                    </AnswersContext>
                  </CurrentClueWriterContext>
                </CurrentClueContext>
              </GridCorrectnessWriterContext>
            </GridCorrectnessContext>
          </GridWriterContext>
        </GridContext>
      </GridCluesContext>
    </GridNumbersContext>
  );
}


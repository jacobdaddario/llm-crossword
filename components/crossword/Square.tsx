"use client";

import { useContext } from "react";

import {
  GridContext,
  GridCorrectnessContext,
  GridCorrectnessWriterContext,
  GridWriterContext,
} from "./PuzzleContext";
import type { CrosswordGridNumber } from "@/types/crossword.types";

type SquareParams = {
  gridIndex: number;
  blackedOut?: boolean;
  number?: CrosswordGridNumber;
};

export function Square({
  gridIndex,
  blackedOut = false,
  number,
}: SquareParams) {
  const gridState = useContext(GridContext);
  const gridWriter = useContext(GridWriterContext);
  const gridCorrectness = useContext(GridCorrectnessContext);
  const gridCorrectnessWriter = useContext(GridCorrectnessWriterContext);

  const gridValue = gridState[gridIndex];
  const correctSquare = gridCorrectness[gridIndex];

  return (
    <div
      className="relative flex items-end size-8 -ml-px -mt-px border border-black empty:bg-black data-correct:bg-green-200 data-false:bg-red-300"
      {...(correctSquare === true ? { "data-correct": "" } : {})}
      {...(correctSquare === false ? { "data-false": "" } : {})}
    >
      {number !== 0 && !blackedOut && (
        <span className="absolute left-0.5 top-0 text-[8px]">{number}</span>
      )}
      {!blackedOut && (
        <input
          value={gridValue}
          maxLength={1}
          onFocus={() => gridCorrectnessWriter(Array(gridState.length))}
          onChange={(e) => {
            gridWriter((grid) => {
              const nextGrid = [...grid];
              nextGrid[gridIndex] = e.target.value;

              return nextGrid;
            });
          }}
          className="outline-none max-w-full text-center uppercase"
        ></input>
      )}
    </div>
  );
}

"use client";

import type { CrosswordGridNumber } from "@/types/crossword.types";
import { useContext } from "react";
import { GridContext, GridWriterContext } from "./PuzzleContext";

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
  const gridValue = gridState[gridIndex];

  return (
    <div className="relative flex items-end size-8 -ml-px -mt-px border border-black empty:bg-black">
      {number !== 0 && !blackedOut && (
        <span className="absolute left-0.5 top-0 text-[8px]">{number}</span>
      )}
      {!blackedOut && (
        <input
          value={gridValue}
          maxLength={1}
          onChange={(e) => {
            gridWriter((grid) => {
              grid[gridIndex] = e.target.value;

              return grid;
            });
          }}
          className="outline-none max-w-full text-center"
        ></input>
      )}
    </div>
  );
}

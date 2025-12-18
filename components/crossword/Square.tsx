"use client";

import { useContext } from "react";
import clsx from "clsx";

import {
  GridContext,
  GridCorrectnessContext,
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

  const gridValue = gridState[gridIndex];
  const correctSquare = gridCorrectness[gridIndex];

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
          className={clsx({
            "outline-none max-w-full text-center": true,
            "bg-green-200": correctSquare === true,
            "bg-red-300": correctSquare === false,
          })}
        ></input>
      )}
    </div>
  );
}

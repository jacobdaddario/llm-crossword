"use client";

import { chunk } from "lodash";

import { Square } from "./Square";
import type { CrosswordGrid, CrosswordSize } from "@/types/crossword.types";

type PuzzleParams = {
  grid: CrosswordGrid;
  dimension: CrosswordSize;
};

// NOTE: `idx` is typically not a stable way to handle keys, but in this case,
// it is due to the shape of the data.
export function Puzzle({ grid, dimension }: PuzzleParams) {
  const chunkedGrid = chunk(grid, dimension.rows);

  return chunkedGrid.map((gridRow, idx) => {
    return (
      <div key={idx} className="flex justify-center max-w-min">
        {gridRow.map((gridValue, jdx) => {
          return <Square blackedOut={gridValue === "."} key={idx + jdx} />;
        })}
      </div>
    );
  });
}

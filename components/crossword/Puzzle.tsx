"use client";

import { chunk, zip } from "lodash";

import { Square } from "./Square";
import type {
  CrosswordGrid,
  CrosswordGridNumbers,
  CrosswordSize,
} from "@/types/crossword.types";

type PuzzleParams = {
  grid: CrosswordGrid;
  numbers: CrosswordGridNumbers;
  dimension: CrosswordSize;
};

// NOTE: `idx` is typically not a stable way to handle keys, but in this case,
// it is due to the shape of the data.
export function Puzzle({ grid, numbers, dimension }: PuzzleParams) {
  const labeledGrid = zip(grid, numbers);
  const chunkedGrid = chunk(labeledGrid, dimension.rows);

  return chunkedGrid.map((gridRow, idx) => {
    return (
      <div key={idx} className="flex justify-center max-w-min">
        {gridRow.map((gridValue, jdx) => {
          const gridIndex = idx * dimension.rows + jdx;

          return (
            <Square
              gridIndex={gridIndex}
              blackedOut={gridValue[0] === "."}
              number={gridValue[1]}
              key={gridIndex}
            />
          );
        })}
      </div>
    );
  });
}

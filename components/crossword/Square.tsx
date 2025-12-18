"use client";

import type { CrosswordGridNumber } from "@/types/crossword.types";

type SquareParams = {
  // gridIndex: number;
  blackedOut?: boolean;
  number?: CrosswordGridNumber;
};

export function Square({ blackedOut = false, number }: SquareParams) {
  return (
    <div className="relative flex items-end size-8 -ml-px -mt-px border border-black empty:bg-black">
      {number !== 0 && !blackedOut && (
        <span className="absolute left-0.5 top-0 text-[8px]">{number}</span>
      )}
      {!blackedOut && (
        <input
          value={"A"}
          className="outline-none max-w-full text-center"
        ></input>
      )}
    </div>
  );
}

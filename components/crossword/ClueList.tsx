"use client";

import {
  CrosswordClueDirection,
  CrosswordClueText,
} from "@/types/crossword.types";

type ClueListParams = {
  direction: CrosswordClueDirection;
  clues: CrosswordClueText[];
};

// NOTE: Typically `idx` is a poor key, but it works with the data structure feeding the crossword renderer.
export function ClueList({ direction, clues }: ClueListParams) {
  return (
    <div className="text-sm max-w-xs h-auto">
      <h2 className="ml-7.5 mb-2 font-semibold capitalize">{direction}</h2>
      <ol className="grid grid-cols-[auto 1fr] gap-y-1 max-h-112 overflow-y-auto">
        {clues.map((clueText, idx) => {
          const words = clueText.split(" ");

          return (
            <li
              key={idx}
              className="grid col-span-2 grid-cols-subgrid gap-1 select-none"
            >
              <span className="text-end font-mono">{words[0]}</span>
              <span>{words.slice(1).join(" ")}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

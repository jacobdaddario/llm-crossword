"use client";

import { useContext, useEffect, useRef } from "react";
import clsx from "clsx";

import { CurrentClueContext } from "./PuzzleContext";
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
  const currentClue = useContext(CurrentClueContext);
  const currentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!currentRef.current) return;

    currentRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentClue]);

  return (
    <div className="text-sm max-w-xs h-auto">
      <h2 className="ml-7.5 mb-2 font-semibold capitalize">{direction}</h2>
      <ol className="grid grid-cols-[auto 1fr] max-h-112 overflow-y-auto">
        {clues.map((clueText, idx) => {
          const words = clueText.split(" ");
          const focusedItem =
            direction === currentClue.direction &&
            idx === currentClue.arrayIndex;

          return (
            <li
              key={idx}
              className={clsx({
                "grid col-span-2 grid-cols-subgrid gap-x-1 py-1.5 select-none": true,
                "bg-blue-100": focusedItem,
              })}
              ref={focusedItem ? currentRef : null}
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

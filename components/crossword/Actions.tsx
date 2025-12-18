"use client";

import { CheckSquare2Icon } from "lucide-react";
import { useContext } from "react";

import { GridContext, GridCorrectnessWriterContext } from "./PuzzleContext";
import { CrosswordGrid } from "@/types/crossword.types";

type ActionsParams = {
  answers: CrosswordGrid;
};

export function Actions({ answers }: ActionsParams) {
  const gridState = useContext(GridContext);
  const setGridCorrectness = useContext(GridCorrectnessWriterContext);

  const checkGrid = () => {
    const gridCorrectness = Array(answers.length);

    gridState.forEach((cellValue, idx) => {
      if (answers[idx] === ".") {
        gridCorrectness[idx] = undefined;
      } else {
        gridCorrectness[idx] = cellValue === answers[idx]?.toLowerCase();
      }
    });

    setGridCorrectness(gridCorrectness);
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => checkGrid()}
        className="flex items-center hover:bg-gray-200 border border-gray-400 outline-none focus:ring focus:ring-gray-300 px-2.5 py-1 rounded"
      >
        <CheckSquare2Icon className="size-4 mr-1.5 -mt-px" />
        Check grid
      </button>
    </div>
  );
}

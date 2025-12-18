"use client";

import { CheckSquare2Icon } from "lucide-react";
import { useContext, type Dispatch, type SetStateAction } from "react";

import { GridContext } from "./PuzzleContext";
import { CrosswordGrid } from "@/types/crossword.types";

type ActionsParams = {
  answers: CrosswordGrid;
  setGridCorrectness: Dispatch<SetStateAction<(boolean | undefined)[]>>;
};

export function Actions({ answers, setGridCorrectness }: ActionsParams) {
  const gridState = useContext(GridContext);

  const checkGrid = () => {
    const gridCorrectness = Array(answers.length);

    gridState.forEach((cellValue, idx) => {
      if (cellValue === ".") {
        gridCorrectness[idx] = undefined;
      } else {
        gridCorrectness[idx] = gridState[idx] === answers[idx];
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

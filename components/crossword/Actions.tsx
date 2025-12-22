"use client";

import { CheckSquare2Icon } from "lucide-react";
import { useContext } from "react";

import {
  GridContext,
  GridCorrectnessWriterContext,
  AnswersContext,
} from "./PuzzleContext";
import { checkPuzzle } from "@/components/llm/tools";

import type { CrosswordGrid } from "@/types/crossword.types";

export function Actions() {
  const gridState = useContext(GridContext);
  const setGridCorrectness = useContext(GridCorrectnessWriterContext);
  const answers = useContext<CrosswordGrid>(AnswersContext);

  return (
    <div className="mt-6">
      <button
        onClick={() => checkPuzzle(gridState, answers, setGridCorrectness)}
        className="flex items-center hover:bg-gray-200 border border-gray-400 outline-none focus:ring focus:ring-gray-300 px-2.5 py-1 rounded"
      >
        <CheckSquare2Icon className="size-4 mr-1.5 -mt-px" />
        Check grid
      </button>
    </div>
  );
}

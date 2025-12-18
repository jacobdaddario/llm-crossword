import { readFile } from "node:fs/promises";
import { cwd } from "node:process";

import { PuzzleContext } from "@/components/crossword/PuzzleContext";
import type { Crossword } from "@/types/crossword.types";

type NextJSParams = {
  slug: string;
};

type PuzzlePageParams = {
  params: Promise<NextJSParams>;
};

export default async function PuzzlePage({ params }: PuzzlePageParams) {
  const { slug } = await params;
  const puzzleDef: Crossword = JSON.parse(
    await readFile(`${cwd()}/crosswords/${slug}.json`, {
      encoding: "utf8",
    }),
  );

  return <PuzzleContext puzzleDef={puzzleDef} />;
}

import { Puzzle } from "@/components/crossword/Puzzle";
import { Crossword } from "@/types/crossword.types";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";

type NextJSParams = {
  slug: string;
};

type PuzzleParams = {
  params: Promise<NextJSParams>;
};

export default async function PuzzlePage({ params }: PuzzleParams) {
  const { slug } = await params;
  const puzzleDef: Crossword = JSON.parse(
    await readFile(`${cwd()}/crosswords/${slug}.json`, {
      encoding: "utf8",
    }),
  );

  return (
    <div className="max-h-screen w-full">
      <div className="mx-auto max-w-5xl p-2">
        <Puzzle grid={puzzleDef.grid} dimension={puzzleDef.size} />
      </div>
    </div>
  );
}

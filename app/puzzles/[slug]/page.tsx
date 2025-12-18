import { PuzzleFrame } from "@/components/crossword/PuzzleFrame";
import { Crossword } from "@/types/crossword.types";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";

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

  return (
    <div className="max-h-screen w-full">
      <div className="p-2">
        <PuzzleFrame puzzleDef={puzzleDef} />
      </div>
    </div>
  );
}

import { ClueList } from "@/components/crossword/ClueList";
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
    <div className="flex justify-center space-x-16 w-full max-h-min mt-12">
      <div className="p-2 shrink-0">
        <PuzzleFrame puzzleDef={puzzleDef} />
      </div>
      <div className="flex mt-28 space-x-6">
        <ClueList direction="across" clues={puzzleDef.clues.across} />
        <ClueList direction="down" clues={puzzleDef.clues.down} />
      </div>
    </div>
  );
}

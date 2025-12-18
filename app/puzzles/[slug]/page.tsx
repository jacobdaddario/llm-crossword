"use client";

import { use } from "react";

type NextJSParams = {
  slug: string;
};

type PuzzleParams = {
  params: Promise<NextJSParams>;
};

export default function Puzzle({ params }: PuzzleParams) {
  const { slug } = use(params);

  return <div>{slug}</div>;
}

"use client";

type SquareParams = {
  // gridIndex: number;
  blackedOut?: boolean;
  number?: number;
};

export function Square({ blackedOut = false, number }: SquareParams) {
  return (
    <div className="relative flex items-end size-8 -ml-px -mt-px border border-black empty:bg-black">
      {number && !blackedOut && (
        <span className="absolute left-0.5 top-0.5 text-xs">{number}</span>
      )}
      {!blackedOut && (
        <input
          value={"A"}
          className="outline-none max-w-full text-center"
        ></input>
      )}
    </div>
  );
}

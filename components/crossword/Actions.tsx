"use client";

import { CheckSquare2Icon } from "lucide-react";

export function Actions() {
  return (
    <div className="mt-6">
      <button className="flex items-center hover:bg-gray-200 border border-gray-400 outline-none focus:ring focus:ring-gray-300 px-2.5 py-1 rounded">
        <CheckSquare2Icon className="size-4 mr-1.5 -mt-px" />
        Check grid
      </button>
    </div>
  );
}

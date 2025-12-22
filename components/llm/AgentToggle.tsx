import { Button } from "@/components/ui/Button";
import { PlayCircle, StopCircle } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function AgentToggle({
  onClick,
  running,
}: {
  onClick: Dispatch<SetStateAction<boolean>>;
  running: boolean;
}) {
  return (
    <Button
      onClick={() => {
        onClick(!running);
      }}
    >
      {running ? <StopCircle /> : <PlayCircle />}
    </Button>
  );
}

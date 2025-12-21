import { Button } from "@/components/ui/Button";
import { PlayCircle, StopCircle } from "lucide-react";
import { useState } from "react";

export function AgentToggle({ onClick }: { onClick: () => void }) {
  // HACK: I wish that this wasn't decoupled from the ref in the custom agent
  // hook. It opens the door for state mistmatch. That said, combining them would involve
  // adding args to the hook or exposing the internal ref. I don't want to do that
  // It just doesn't feel worth it just to ensure state consistency on such a small project.
  const [running, setRunning] = useState(false);

  return (
    <Button
      onClick={() => {
        onClick();
        setRunning(!running);
      }}
    >
      {running ? <StopCircle /> : <PlayCircle />}
    </Button>
  );
}

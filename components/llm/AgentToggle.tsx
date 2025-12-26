import { Button } from "@/components/ui/Button";
import { PlayCircle, StopCircle } from "lucide-react";

export function AgentToggle({
  onClick,
  running,
}: {
  onClick: () => void;
  running: boolean;
}) {
  return (
    <Button onClick={onClick}>
      {running ? <StopCircle /> : <PlayCircle />}
    </Button>
  );
}

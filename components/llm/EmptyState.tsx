import { useState } from "react";
import { MessageSquareDashed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/Empty";

export function EmptyState({ onClick }: { onClick: () => void }) {
  const [booting, setBooting] = useState(false);

  return (
    <Empty className="hidden only:flex">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquareDashed />
        </EmptyMedia>
        <EmptyTitle>Session not started</EmptyTitle>
        <EmptyDescription>
          An agent session hasn&apos;t been started yet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={() => {
            onClick();
            setBooting(true);
          }}
          {...(booting ? { disabled: true } : {})}
        >
          Start session
        </Button>
      </EmptyContent>
    </Empty>
  );
}

import {
  ThreadRail,
  ThreadRailFile,
  ThreadRailFileIcon,
  ThreadRailFooter,
  ThreadRailItem,
  ThreadRailLine,
  ThreadRailMore,
  ThreadRailPopover,
  ThreadRailSummary,
  ThreadRailTitle,
} from "@/components/control-ui/thread-rail";

// Host app maps its conversation into plain ThreadRail props: one tick per user message, popover shows prompt + part of reply.
type UserTurn = {
  id: string;
  prompt: string;
  reply: string;
  files: string[];
};

export function Example({ turns, inViewId }: { turns: UserTurn[]; inViewId?: string }) {
  return (
    <ThreadRail>
      {turns.map((turn) => {
        const visible = turn.files.slice(0, 2);
        const overflow = turn.files.length - visible.length;

        return (
          <ThreadRailItem key={turn.id} inView={turn.id === inViewId}>
            <ThreadRailLine aria-label={turn.prompt} />
            <ThreadRailPopover>
              <ThreadRailTitle>{turn.prompt}</ThreadRailTitle>
              <ThreadRailSummary>{turn.reply}</ThreadRailSummary>
              {turn.files.length > 0 ? (
                <ThreadRailFooter>
                  {visible.map((file) => (
                    <ThreadRailFile key={file}>
                      <ThreadRailFileIcon>#</ThreadRailFileIcon>
                      {file}
                    </ThreadRailFile>
                  ))}
                  {overflow > 0 ? <ThreadRailMore>+{overflow}</ThreadRailMore> : null}
                </ThreadRailFooter>
              ) : null}
            </ThreadRailPopover>
          </ThreadRailItem>
        );
      })}
    </ThreadRail>
  );
}

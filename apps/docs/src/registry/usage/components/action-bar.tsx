import { ActionBar, ActionBarCopy, ActionBarEdit, ActionBarItem } from "@/components/control-ui/action-bar";

const messageText = "The assistant response you want to copy";

export function Example({ onEdit }: { onEdit: (value: string) => void }) {
  return (
    <ActionBar label="Response actions" copyValue={messageText} editValue={messageText} onEdit={onEdit}>
      <ActionBarCopy />
      <ActionBarEdit />
      <ActionBarItem>Share</ActionBarItem>
      <ActionBarItem>More</ActionBarItem>
    </ActionBar>
  );
}

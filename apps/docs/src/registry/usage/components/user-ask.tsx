import type { UserAskAnswers } from "@/components/control-ui/contracts";
import {
  UserAsk,
  UserAskDismiss,
  UserAskFooter,
  UserAskHeader,
  UserAskOption,
  UserAskOptionInput,
  UserAskOptionLabel,
  UserAskQuestion,
  UserAskSubmit,
  UserAskTitle,
} from "@/components/control-ui/user-ask";

// Render your agent's ask-user tool call in place of the composer; feed the answers back as the tool result.
export function Example({ onAnswer }: { onAnswer: (answers: UserAskAnswers) => void }) {
  return (
    <UserAsk autoFocus onComplete={onAnswer} onDismiss={() => onAnswer({})}>
      <UserAskHeader>
        <UserAskTitle />
      </UserAskHeader>
      <UserAskQuestion id="scope" title="What should this run focus on?" defaultValue="fix">
        <UserAskOption value="fix" recommended>
          <UserAskOptionLabel>Tiny repo fix</UserAskOptionLabel>
        </UserAskOption>
        <UserAskOption value="polish">
          <UserAskOptionLabel>UI polish</UserAskOptionLabel>
        </UserAskOption>
        <UserAskOptionInput label="Something else" />
      </UserAskQuestion>
      <UserAskFooter>
        <UserAskDismiss />
        <UserAskSubmit />
      </UserAskFooter>
    </UserAsk>
  );
}

import { BookOpen, Search, SquareTerminal } from "lucide-react";

import {
  Activity,
  ActivityContent,
  ActivityIcon,
  ActivityItem,
  ActivityList,
  ActivityStatus,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";

export function Example() {
  return (
    <Activity state="running" defaultOpen>
      <ActivityTrigger>
        <ActivityIcon>
          <BookOpen />
        </ActivityIcon>
        <ActivityTitle>Thinking</ActivityTitle>
        <ActivityStatus className="sr-only" />
      </ActivityTrigger>
      <ActivityContent>
        <ActivityList>
          <ActivityItem icon={<SquareTerminal />}>Ran the validation command</ActivityItem>
          <ActivityItem icon={<Search />}>Searched for affected components</ActivityItem>
          <ActivityItem icon={<BookOpen />}>Read the component contract</ActivityItem>
        </ActivityList>
      </ActivityContent>
    </Activity>
  );
}

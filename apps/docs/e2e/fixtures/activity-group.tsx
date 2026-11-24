import { createRoot } from "react-dom/client";
import {
  Activity,
  ActivityContent,
  ActivityDetail,
  ActivityDetailContent,
  ActivityIcon,
  ActivityRow,
  ActivityTitle,
  ActivityTrigger,
} from "@/components/control-ui/activity";

function Fixture() {
  return (
    <div style={{ inlineSize: 420, padding: 24 }}>
      <Activity kind="tool" state="running" defaultOpen>
        <ActivityTrigger aria-label="Run">
          <ActivityIcon />
          <ActivityTitle>Editing AGENTS.md</ActivityTitle>
        </ActivityTrigger>
        <ActivityContent>
          <Activity kind="reasoning" state="success">
            <ActivityTrigger aria-label="Thought">
              <ActivityIcon />
              <ActivityTitle>Thought for 2s</ActivityTitle>
            </ActivityTrigger>
            <ActivityContent>
              <ActivityDetail>
                <ActivityDetailContent>Look at the file first.</ActivityDetailContent>
              </ActivityDetail>
            </ActivityContent>
          </Activity>
          <Activity kind="tool" state="success">
            <ActivityRow aria-label="Read">
              <ActivityIcon />
              <ActivityTitle>Read AGENTS.md</ActivityTitle>
            </ActivityRow>
          </Activity>
          <Activity kind="tool" state="running">
            <ActivityRow aria-label="Edit">
              <ActivityIcon />
              <ActivityTitle>Editing AGENTS.md</ActivityTitle>
            </ActivityRow>
          </Activity>
        </ActivityContent>
      </Activity>
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);

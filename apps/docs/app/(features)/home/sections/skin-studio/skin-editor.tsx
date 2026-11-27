import { FileCodeIcon, FileTextIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/control-ui/lib/cn";
import { Heading, Text } from "@/components/control-ui/ui/typography";
import { type AcmeFile, acmeFiles, acmeLineCount, pinForLine } from "./acme-skin";
import { PinButton, PinLine } from "./pin-context";
import { type SourceLine, type Token, type TokenKind, tokenizeSource } from "./tokenize";

export type KnobFacts = { name: string; syntax: string; initialValue: string; familyKnobCount: number };

const tokenClassNames: Record<Exclude<TokenKind, "swatch">, string> = {
  plain: "text-(--code-token-punctuation)",
  name: "text-foreground",
  string: "text-(--code-token-string)",
  keyword: "text-(--code-token-keyword)",
  function: "text-(--code-token-constant)",
  number: "text-(--code-token-parameter)",
  type: "text-(--code-token-function)",
};

const gutterClassName = "grid w-7 shrink-0 place-items-center @md/skin-editor:w-11";

function CodeToken({ token, emphasized }: { token: Token; emphasized: boolean }) {
  if (token.kind === "swatch") {
    return (
      <span
        aria-hidden="true"
        style={{ backgroundColor: token.text }}
        className="mr-1.25 hidden size-2.5 translate-y-px rounded-[calc(var(--radius-sm)/2)] outline outline-foreground/12 -outline-offset-1 @md/skin-editor:inline-block"
      />
    );
  }
  return <span className={cn(tokenClassNames[token.kind], emphasized && "font-medium")}>{token.text}</span>;
}

function CodeLine({ file, line }: { file: AcmeFile; line: SourceLine }) {
  const pin = pinForLine(file.name, line.text);
  const code = (
    <Text as="code" size="label" mono className="whitespace-pre">
      {line.tokens.map((token) => (
        <CodeToken key={token.start} token={token} emphasized={token.text === pin?.match} />
      ))}
    </Text>
  );
  if (pin) {
    return (
      <PinLine pin={pin.id}>
        <span className={gutterClassName}>
          <PinButton pin={pin.id} side="code" />
        </span>
        {code}
      </PinLine>
    );
  }
  return (
    <li className="flex h-6 items-center @md/skin-editor:pr-4">
      <span aria-hidden="true" className={cn(gutterClassName, "opacity-70")}>
        <Text size="caption" tone="muted" mono numeric>
          {line.number}
        </Text>
      </span>
      {code}
    </li>
  );
}

function FilePane({ file, children }: { file: AcmeFile; children?: ReactNode }) {
  const Icon = file.language === "tsx" ? FileCodeIcon : FileTextIcon;
  return (
    <div className="flex min-w-0 flex-col border-b">
      <header className="flex h-10 items-center gap-2 border-b bg-muted px-4">
        <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        <Heading level={3} size="label" weight="medium" mono className="min-w-0 flex-1 truncate">
          {file.name}
        </Heading>
        <Text size="caption" tone="muted" className="shrink-0">
          {file.role}
        </Text>
      </header>
      <div className="overflow-x-auto">
        <ol className="w-max min-w-full py-3">
          {tokenizeSource(file.source, file.language).map((line) => (
            <CodeLine key={line.number} file={file} line={line} />
          ))}
        </ol>
      </div>
      {children}
    </div>
  );
}

function KnobFact({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid gap-0.75">
      <Text as="dt" size="micro" tone="muted">
        {term}
      </Text>
      <Text as="dd" size="caption" mono>
        {value}
      </Text>
    </div>
  );
}

function KnobCard({ knob }: { knob: KnobFacts }) {
  return (
    <div className="pt-1 pr-4 pb-4 pl-8 @md/skin-editor:pl-11">
      <div className="grid gap-2.5 rounded-lg border bg-card p-3.5 shadow-md">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 rounded-sm bg-muted px-1.5 py-0.5">
            <Text size="micro" tone="muted" mono>
              @property
            </Text>
          </span>
          <Text size="label" weight="medium" mono className="min-w-0 truncate">
            {knob.name}
          </Text>
        </div>
        <dl className="flex flex-wrap gap-x-5.5 gap-y-2">
          <KnobFact term="syntax" value={knob.syntax} />
          <KnobFact term="initial" value={knob.initialValue} />
          <KnobFact term="on Button" value={`${knob.familyKnobCount} knobs`} />
        </dl>
        <Text as="p" size="caption" tone="muted" className="text-pretty">
          Typed, so a bad value falls back to the initial instead of breaking the paint.
        </Text>
      </div>
    </div>
  );
}

export function SkinEditor({ knob }: { knob?: KnobFacts }) {
  return (
    <div className="@container/skin-editor flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card">
      {acmeFiles.map((file) => (
        <FilePane key={file.name} file={file}>
          {knob && file.source.includes(knob.name) ? <KnobCard knob={knob} /> : null}
        </FilePane>
      ))}
      <footer className="mt-auto flex h-8.5 items-center gap-3.5 bg-muted px-4">
        <Text size="caption" tone="muted" mono className="min-w-0 flex-1 truncate">
          skins/acme
        </Text>
        <Text size="caption" tone="muted" mono className="hidden shrink-0 @md/skin-editor:inline">
          {acmeFiles.length} files · {acmeLineCount} lines
        </Text>
        <span className="flex shrink-0 items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
          <Text size="caption" mono>
            0 component files edited
          </Text>
        </span>
      </footer>
    </div>
  );
}

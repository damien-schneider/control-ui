import { Heading } from "@/components/control-ui/ui/typography";

const defaultSkinName = "yours";

export function SkinStamp() {
  return (
    <div className="-mx-1 overflow-x-clip px-1">
      <div className="@container w-[165%] @4xl/home:w-[88%]">
        <Heading
          level={2}
          id="start-title"
          size="hero"
          weight="medium"
          tone="foreground"
          mono
          className="flex w-[calc(100%/1.65)] min-w-0 flex-col whitespace-nowrap @4xl/home:w-[calc(100%/0.88)] @4xl/home:flex-row @4xl/home:items-center"
        >
          <span className="sr-only">Make data-skin yours.</span>
          <span aria-hidden="true" className="text-foreground/30">
            data-skin=
          </span>
          <span className="flex min-w-0 items-center">
            <span aria-hidden="true" className="text-foreground/30">
              "
            </span>
            <label className="group/skin flex min-w-0 cursor-text items-center gap-[0.07em] rounded-md bg-info/12 px-[0.08em] transition-colors duration-(--duration-fast) ease-(--ease-standard) focus-within:bg-info/20 hover:bg-info/20">
              <input
                type="text"
                name="skin"
                aria-label="Skin name"
                defaultValue={defaultSkinName}
                placeholder={defaultSkinName}
                size={defaultSkinName.length}
                maxLength={16}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                className="field-sizing-content min-w-[1ch] shrink rounded-sm bg-transparent caret-info outline-none placeholder:text-foreground/30"
              />
              <span
                aria-hidden="true"
                className="h-[0.95em] w-[0.06em] shrink-0 animate-[home-caret-blink_1.1s_steps(1)_infinite] bg-info group-focus-within/skin:invisible motion-reduce:animate-none"
              />
            </label>
            <span aria-hidden="true" className="text-foreground/30">
              "
            </span>
          </span>
        </Heading>
      </div>
    </div>
  );
}

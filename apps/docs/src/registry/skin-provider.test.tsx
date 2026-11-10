import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { controlEffectsAttribute, skinScopeAttributes } from "./skin";
import { SkinAdornment, SkinProvider, useSkin } from "./skin-provider";

function SkinProbe() {
  const skin = useSkin();
  return (
    <span data-skin={skin.id} data-effects={controlEffectsAttribute(skin.effects)}>
      <SkinAdornment scope="dialog" part="titlebar" context={{}} />
    </span>
  );
}

test("components need no provider or skin config", () => {
  expect(renderToStaticMarkup(<SkinProbe />)).toBe("<span></span>");
});

test("nested and sibling providers keep consumer config within their own tree", () => {
  const html = renderToStaticMarkup(
    <>
      <SkinProvider skin={{ id: "acme", effects: ["ripple"], adornments: { dialog: { titlebar: <b>Acme</b> } } }}>
        <SkinProbe />
        <SkinProvider skin={{ id: "other" }}>
          <SkinProbe />
        </SkinProvider>
        <SkinProbe />
      </SkinProvider>
      <SkinProbe />
    </>,
  );
  expect(html).toBe(
    '<span data-skin="acme" data-effects="ripple"><b>Acme</b></span><span data-skin="other"></span><span data-skin="acme" data-effects="ripple"><b>Acme</b></span><span></span>',
  );
});

test("a skin boundary carries every attribute-borne intent of its config", () => {
  const html = renderToStaticMarkup(
    <div {...skinScopeAttributes({ id: "acme", motion: "reduced", colorScheme: "light", effects: ["ripple", "top-shine"] })} />,
  );
  expect(html).toBe('<div data-skin="acme" data-effects="ripple top-shine" data-motion="reduced"></div>');
});

test("an unset intent leaves the host's own attribute in place", () => {
  const html = renderToStaticMarkup(<div data-skin="host" data-motion="reduced" {...skinScopeAttributes({ effects: [] })} />);
  expect(html).toBe('<div data-skin="host" data-motion="reduced"></div>');
});

import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerChannel,
  ColorPickerChannels,
  ColorPickerFormatSelect,
  ColorPickerHue,
  ColorPickerInput,
  ColorPickerPanel,
  ColorPickerSwatch,
  ColorPickerSwatches,
  ColorPickerTrigger,
  ColorPickerWheel,
} from "./color-picker";

describe("ColorPicker accessible names", () => {
  test("every control is named without caller-supplied labels", () => {
    const html = renderToString(
      <ColorPicker defaultValue="#22c55e">
        <ColorPickerTrigger />
        <ColorPickerPanel>
          <ColorPickerWheel />
          <ColorPickerHue />
          <ColorPickerAlpha />
          <ColorPickerInput />
          <ColorPickerFormatSelect />
          <ColorPickerChannels>
            <ColorPickerChannel channel="r" />
          </ColorPickerChannels>
          <ColorPickerSwatches>
            <ColorPickerSwatch color="#ff0000" />
          </ColorPickerSwatches>
        </ColorPickerPanel>
      </ColorPicker>,
    );

    for (const name of [
      "Choose color (#22c55e)",
      "Wheel hue",
      "Wheel saturation",
      "Hue",
      "Opacity",
      "Color value",
      "Color format",
      "Red channel",
      "Set color #ff0000",
    ]) {
      expect(html).toContain(`aria-label="${name}"`);
    }
  });
});

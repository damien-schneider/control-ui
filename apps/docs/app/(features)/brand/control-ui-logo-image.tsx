import { controlUiLogoSvg } from "./logo";

const logoSource = `data:image/svg+xml,${encodeURIComponent(controlUiLogoSvg)}`;

export function ControlUiLogoImage({ size }: { size: number }) {
  return <img alt="" src={logoSource} width={size} height={size} />;
}

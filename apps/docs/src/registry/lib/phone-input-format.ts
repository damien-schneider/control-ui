import { AsYouType } from "libphonenumber-js/max";
import { type Country, getCountryCallingCode, type Value } from "react-phone-number-input/max";

export function normalizePhoneInputText(value: string, country: Country | undefined) {
  if (!country) return value;

  const callingCode = `+${getCountryCallingCode(country)}`;
  if (!value.startsWith(callingCode)) return value;

  const nationalDigits = value.slice(callingCode.length).replaceAll(/\D/g, "");
  if (!nationalDigits) return value;

  const nationalFormatter = new AsYouType(country);
  nationalFormatter.input(nationalDigits);
  const normalizedValue = nationalFormatter.getNumberValue();
  return normalizedValue ? new AsYouType().input(normalizedValue) : value;
}

export function normalizePhoneInputValue(value: Value | undefined, country: Country | undefined) {
  if (!value || !country) return value;

  const callingCode = `+${getCountryCallingCode(country)}`;
  if (!value.startsWith(callingCode)) return value;

  const nationalDigits = value.slice(callingCode.length);
  if (!nationalDigits) return value;

  const formatter = new AsYouType(country);
  formatter.input(nationalDigits);
  return formatter.getNumberValue();
}

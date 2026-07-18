import { isPossiblePhoneNumber, isValidPhoneNumber, type Value as PhoneInputValue, parsePhoneNumber } from "react-phone-number-input/max";
import { e164 } from "zod";

export type PhoneNumberValidationMode = "possible" | "valid";

export type PhoneNumberSchemaMessages = {
  format?: string;
  invalid?: string;
  mobile?: string;
};

export type PhoneNumberSchemaOptions = {
  mode?: PhoneNumberValidationMode;
  mobileOnly?: boolean;
  messages?: PhoneNumberSchemaMessages;
};

const DEFAULT_MESSAGES = {
  format: "Enter a phone number in international format.",
  invalid: "Enter a valid phone number.",
  mobile: "Enter a mobile phone number.",
} as const;

const MOBILE_TYPES = new Set(["MOBILE", "FIXED_LINE_OR_MOBILE"]);

function isMobilePhoneNumber(value: string) {
  try {
    const type = parsePhoneNumber(value)?.getType();
    return type ? MOBILE_TYPES.has(type) : false;
  } catch {
    return false;
  }
}

export function createPhoneNumberSchema({ mode = "valid", mobileOnly = false, messages = {} }: PhoneNumberSchemaOptions = {}) {
  const isAccepted = mode === "possible" ? isPossiblePhoneNumber : isValidPhoneNumber;

  let schema = e164(messages.format ?? DEFAULT_MESSAGES.format).refine(isAccepted, messages.invalid ?? DEFAULT_MESSAGES.invalid);

  if (mobileOnly) {
    schema = schema.refine(isMobilePhoneNumber, messages.mobile ?? DEFAULT_MESSAGES.mobile);
  }

  return schema.transform((value): PhoneInputValue => value);
}

export const phoneNumberSchema = createPhoneNumberSchema();
export const possiblePhoneNumberSchema = createPhoneNumberSchema({ mode: "possible" });
export const mobilePhoneNumberSchema = createPhoneNumberSchema({ mobileOnly: true });

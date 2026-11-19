import { describe, expect, test } from "bun:test";
import { modelIdentity } from "./model-name";

describe("modelIdentity", () => {
  test.each([
    ["claude-opus-4-5-20251101", "Claude Opus 4.5"],
    ["claude-3-5-sonnet-latest", "Claude 3.5 Sonnet"],
    ["anthropic/claude-haiku-4-5", "Claude Haiku 4.5"],
    ["gpt-4o-mini", "GPT-4o mini"],
    ["openai/gpt-5.1-codex", "GPT-5.1 Codex"],
    ["gpt-4.1-2025-04-14", "GPT-4.1"],
    ["o3-mini", "o3-mini"],
    ["gemini-2.5-flash", "Gemini 2.5 Flash"],
    ["groq/llama-3.3-70b-versatile", "Llama 3.3 70B Versatile"],
    ["deepseek-r1", "DeepSeek R1"],
    ["moonshotai/kimi-k2-thinking", "Kimi K2 Thinking"],
    ["qwen3-235b-a22b", "Qwen3 235B A22B"],
    ["glm-4.6", "GLM 4.6"],
    ["mistral-large-latest", "Mistral Large"],
    ["opus", "Opus"],
  ])("%s reads as %s", (id, name) => {
    expect(modelIdentity(id).name).toBe(name);
  });

  test.each([
    ["claude-sonnet-4-5", undefined, "anthropic"],
    ["openrouter/anthropic/claude-sonnet-4", undefined, "anthropic"],
    ["groq/llama-3.3-70b-versatile", undefined, "meta"],
    ["gpt-oss-120b", "groq", "openai"],
    ["gemma-3-27b", undefined, "google"],
    ["x-ai/grok-4", undefined, "xai"],
    ["opus", "anthropic.messages", "anthropic"],
    ["some-house-model", "groq", "groq"],
    ["some-house-model", "acme", "acme"],
    ["openrouter/acme/house-model", undefined, "acme"],
    ["bedrock/house-model", undefined, "amazon"],
    ["some-house-model", undefined, undefined],
  ])("%s from %s is made by %s", (id, provider, lab) => {
    expect(modelIdentity(id, provider).lab).toBe(lab);
  });
});

declare module "@mastra/core/test-utils/llm-mock" {
  import type { MastraLanguageModel } from "@mastra/core/agent";

  type MockStreamResult = {
    rawCall?: {
      rawPrompt: unknown;
      rawSettings: Record<string, unknown>;
    };
    stream: ReadableStream<unknown>;
    warnings?: readonly unknown[];
  };

  type MastraLanguageModelV2MockConfig = {
    provider?: string;
    modelId?: string;
    doStream?: (options: unknown) => MockStreamResult | Promise<MockStreamResult>;
  };

  export const MastraLanguageModelV2Mock: new (config?: MastraLanguageModelV2MockConfig) => MastraLanguageModel;

  export function simulateReadableStream<Chunk>(options: {
    chunks: readonly Chunk[];
    initialDelayInMs?: number;
    chunkDelayInMs?: number;
  }): ReadableStream<Chunk>;
}

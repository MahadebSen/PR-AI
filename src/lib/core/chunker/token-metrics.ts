import { encode } from "gpt-tokenizer";

export function countTokens(text: string): number {
  if (!text) {
    return 0;
  }

  return encode(text).length;
}

export type TokenMetrics = {
  raw: number;
  filtered: number;
  chunked: number;
};

export function computeTokenMetrics(
  rawText: string,
  filteredText: string,
  chunkedTexts: string[],
): TokenMetrics {
  return {
    raw: countTokens(rawText),
    filtered: countTokens(filteredText),
    chunked: chunkedTexts.reduce((sum, text) => sum + countTokens(text), 0),
  };
}

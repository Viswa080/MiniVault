// utils/cryptoUtil.ts
import { Buffer } from "buffer";

/**
 * Normalize Base64 string: remove whitespace, handle URL-safe chars, pad if needed
 */
function normalizeBase64(str: string): string {
  str = str.replace(/\s/g, "");                 // remove spaces/newlines
  str = str.replace(/-/g, "+").replace(/_/g, "/"); // URL-safe → standard
  while (str.length % 4) str += "=";            // pad to multiple of 4
  return str;
}

/**
 * Convert byte array to Base64 safely (browser + Node)
 */
function bytesToBase64(bytes: Uint8Array): string {
   // Node / React Native
  return Buffer.from(bytes).toString("base64");
}
/**
 * Convert Base64 to byte array safely
 */
function base64ToBytes(base64: string): Uint8Array {
 base64 = normalizeBase64(base64);
  return new Uint8Array(Buffer.from(base64, "base64"));
}
// Custom lightweight encryption
export const encrypt = (text: string, secretKey: string): string => {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const keyBytes = encoder.encode(textToUniqueChar(secretKey));

  const encrypted = textBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  return bytesToBase64(encrypted);
};

// Custom lightweight decryption
export const decrypt = (encryptedText: string, secretKey: string): string => {
  const encryptedBytes = base64ToBytes(encryptedText);
  const keyBytes = new TextEncoder().encode(textToUniqueChar(secretKey));

  const decryptedBytes = encryptedBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  return new TextDecoder().decode(decryptedBytes);
};

/**
 * Converts a given text string into a unique single Unicode character (emoji/symbol).
 * Optionally adds randomization for variation.
 *
 * @param text - The input string to convert
 * @param randomize - Whether to randomize the output (default: false)
 * @returns A single Unicode character (emoji/symbol)
 */
export const textToUniqueChar = (text: string, randomize: boolean = false): string => {
  let hash = 0;
  // Create a simple 32-bit hash from the input string
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // force to 32-bit integer
  }

  // Optional randomization for variation
  if (randomize) {
    hash ^= Math.floor(Math.random() * 0xFFFF);
  }

  // Map hash to visible Unicode emoji/symbol range (U+1F300 – U+1FAFF)
  const base = 0x1F600;
  const range = 0x1FAFF - 0x1F600;
  const codePoint = base + (Math.abs(hash) % range);
  // console.log("used enc was :",String.fromCodePoint(codePoint));
  return String.fromCodePoint(codePoint);
}


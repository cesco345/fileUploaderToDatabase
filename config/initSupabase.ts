import * as SecureStore from "expo-secure-store";
import pako from "pako";
import "react-native-url-polyfill/auto";
import { encode, decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";

const compressAndEncode = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString);
    const encoded = encode(compressed);
    console.log("Compressed and encoded data:", encoded);
    return encoded;
  } catch (error) {
    console.error("Error during compression and encoding:", error);
    throw error;
  }
};

const decodeAndDecompress = (encodedData: string): any => {
  try {
    const decoded = decode(encodedData);
    const decompressed = pako.inflate(decoded, { to: "string" });
    const parsedData = JSON.parse(decompressed);
    console.log("Decoded and decompressed data:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error during decoding and decompression:", error);
    throw error;
  }
};
// Use a custom secure storage solution for the Supabase client to store the JWT
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<any | null> => {
    const encodedData = await SecureStore.getItemAsync(key);
    if (!encodedData) return null;
    return decodeAndDecompress(encodedData);
  },
  setItem: async (key: string, value: any): Promise<void> => {
    const compressedValue = compressAndEncode(value);
    await SecureStore.setItemAsync(key, compressedValue);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};

const url = "https://vjaqwxoqxqzujnwmcvul.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXF3eG9xeHF6dWpud21jdnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1NTkzMTYsImV4cCI6MjAzMzEzNTMxNn0.t-x_l1Aesy9AjVLJuJ6Uv4-dGts_jsDaypgUTBdXStM";

// Initialize the Supabase client
export const supabase = createClient(url, key, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    detectSessionInUrl: false,
  },
});

import { z } from "zod";
import { isAddress } from "viem";

export const formSchema = z.object({
  tokenAddress: z
    .string()
    .trim()
    .min(1, "Token address is required.")
    .refine(isAddress, "Invalid Ethereum address"),
  contacts: z
    .string()
    .trim()
    .min(1, { message: "Receipents is required" })
    .transform(
      (text) =>
        text
          .split(/\n|,/)
          .map((s) => s.trim())
          .filter(Boolean) // remove empty lines or entries
    )
    .refine((addresses) => addresses.every((addr) => isAddress(addr)), {
      message: "One or more addresses are invalid",
    }),
  amounts: z
    .string()
    .trim()
    .min(1, { message: "Amounts is required" })
    .transform((text) =>
      text
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
    )
    .refine(
      (numbers) =>
        numbers.every((number) => Number.isFinite(number) && !isNaN(number)),
      {
        message: "One or more amounts are invalid",
      }
    ),
});

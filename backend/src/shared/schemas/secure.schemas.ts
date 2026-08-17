import { z } from "zod"

export const codeSchema = z
  .string()
  .length(6)
  .regex(/^\d+$/)

export const tokenSchema = z
  .string()
  .length(64)
  .regex(/^[a-f0-9]{64}$/)
import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor HP tidak valid");

export const otpRequestSchema = z.object({
  step: z.literal("request"),
  phone: phoneSchema,
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100).optional(),
});

export const otpVerifySchema = z.object({
  step: z.literal("verify"),
  phone: phoneSchema,
  code: z.string().length(6, "Kode OTP harus 6 digit"),
  challengeToken: z.string().min(1),
});

export const authRequestSchema = z.discriminatedUnion("step", [otpRequestSchema, otpVerifySchema]);

export const energyLogSchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Format periode harus "YYYY-MM"'),
  consumptionKwh: z.coerce.number().positive("Konsumsi harus lebih dari 0").max(100000),
});

export const reportCreateSchema = z.object({
  category: z.string().trim().min(2).max(50),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(1000),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const reportStatusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "IN_PROGRESS", "RESOLVED"]),
  notes: z.string().trim().max(500).optional(),
});

import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().trim().min(1).max(120),
  cognome: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const dateFlexible = z
  .string()
  .trim()
  .min(1)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Data non valida");

export const richiestaCreateSchema = z.object({
  dataInizio: dateFlexible,
  dataFine: dateFlexible,
  categoriaId: z.string().min(1),
  motivazione: z.string().trim().min(1).max(4000),
});

export const richiestaUpdateSchema = richiestaCreateSchema;

const yearMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Formato mese richiesto: YYYY-MM");

export const statisticheQuerySchema = z.object({
  mese: yearMonth.optional(),
  dipendenteId: z.string().min(1).optional(),
});

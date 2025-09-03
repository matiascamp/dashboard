import { z } from "zod";

export const formDataSchema = z.object({
  budgetId: z.number().nullable(),
  client: z
    .string()
    .min(1, "El nombre del cliente es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  text: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(1000, "La descripción es demasiado larga"),
  materialPrice: z.number().nonnegative("Debe ser un número positivo").min(1,"El monto de materiales es obligatorio y mayor a 0"),
  labor: z.number().nonnegative("Debe ser un número positivo").min(1,"El monto de mano de obra es obligatorio y mayor a 0"),
});

export type FormData = z.infer<typeof formDataSchema>;

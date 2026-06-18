import { z } from "zod";

export const movementSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    description: z.string().optional(),
    type: z.enum(["incoming", "outcoming"]),
    currency: z.enum(["ARS", "USD"]),
    /** En ARS el formulario envía 0; no debe exigirse mínimo 0.01 aquí (eso solo aplica en USD vía superRefine). */
    dollarRate: z.number().min(0, "La cotización no puede ser negativa"),
    invoice: z.enum(["a facturar","no factura"]),
  }).superRefine((data, ctx) => {
    if (data.currency === "USD" && data.dollarRate < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dollarRate"],
        message: "La cotización del dólar es obligatoria para USD",
      });
    }
  });
  
export type MovementFormData = z.infer<typeof movementSchema>;
  
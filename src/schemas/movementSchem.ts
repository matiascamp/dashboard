import z from "zod";

export const movementSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    description: z.string().min(1, "La descripción es obligatoria"),
    type: z.enum(["incoming", "outcoming"]),
    currency: z.enum(["ARS", "USD"]),
    dollarRate: z.number().min(0.01, "La cotización debe ser mayor a 0").optional(),
  }).superRefine((data, ctx) => {
    if (data.currency === "USD" && (!data.dollarRate || data.dollarRate <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dollarRate"],
        message: "La cotización del dólar es obligatoria para USD",
      });
    }
  });
  
export type MovementFormData = z.infer<typeof movementSchema>;
  
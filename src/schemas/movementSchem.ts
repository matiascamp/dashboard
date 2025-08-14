import z from "zod";

export const movementSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    description: z.string().min(1, "La descripción es obligatoria"),
    type: z.enum(["incoming", "outcoming"]),
  });
  
export type MovementFormData = z.infer<typeof movementSchema>;
  
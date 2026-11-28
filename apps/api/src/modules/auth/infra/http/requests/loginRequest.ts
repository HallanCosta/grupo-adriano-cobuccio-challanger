import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z
    .string({ error: 'Informe o e-mail' })
    .trim()
    .toLowerCase()
    .min(1, 'Informe o e-mail')
    .max(254, 'E-mail muito longo')
    .pipe(z.email({ error: 'E-mail inválido' })),
  password: z
    .string({ error: 'Informe a senha' })
    .min(1, 'Informe a senha')
    // Same upper bound as registration, so a huge body can't make hashing expensive.
    .max(128, 'A senha deve ter no máximo 128 caracteres'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

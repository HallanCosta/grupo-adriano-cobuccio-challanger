import { z } from 'zod';

export const registerRequestSchema = z.object({
  name: z
    .string({ error: 'Informe o nome' })
    .trim()
    .min(1, 'Informe o nome')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z
    .string({ error: 'Informe o e-mail' })
    .trim()
    .toLowerCase()
    .max(254, 'E-mail muito longo')
    .pipe(z.email({ error: 'E-mail inválido' })),
  password: z
    .string({ error: 'Informe a senha' })
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    // Upper bound so a huge body can't make hashing expensive.
    .max(128, 'A senha deve ter no máximo 128 caracteres'),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

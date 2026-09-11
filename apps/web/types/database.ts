import { z } from "zod";

export const userRowSchema = z.object({
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  user_password_hash: z.string().optional(),
  user_created_at: z.string(),
  user_updated_at: z.string().optional(),
});
export type UserRow = z.infer<typeof userRowSchema>;

import { z } from "zod";

export const architectConfigSchema = z.object({
  sortClasses: z.boolean().optional(),
  removeRedundant: z.boolean().optional(),
  detectConflicts: z.boolean().optional(),
  readabilityMode: z.boolean().optional(),
  autoFix: z.boolean().optional(),
  classFunctions: z.array(z.string()).optional(),
  plugins: z.array(z.string()).optional()
});

export type ArchitectConfigInput = z.infer<typeof architectConfigSchema>;

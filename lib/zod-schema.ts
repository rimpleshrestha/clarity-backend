import z from "zod";

const userCreateSchema = z.object({
  email: z.string().email({ message: "Email is Required" }),
  password: z.string({ message: "Password is Required" }),
});

const moodSchema = z.object({
  name: z.string().min(1, "Required"),
  icon: z.string().min(1, "Required"),
});
const tagSchema = z.object({
  name: z.string().min(1, "Required"),
});
const pinSchema = z.object({
  code: z.string().min(1, "Required"),
  user_id: z.number(),
});
const journalSchema = z.object({
  title: z.string().min(1, "Required"),
  entry: z.string().min(1, "Required"),
  is_favorate: z.boolean().default(false),
  mood_id: z.number().min(1, "Required"),
  tag_id: z.array(z.number()).min(1, "Required"),

});

type userCreateType = z.infer<typeof userCreateSchema>;
type moodType = z.infer<typeof moodSchema>;
type tagType = z.infer<typeof tagSchema>;
type journalType = z.infer<typeof journalSchema>;
type pinType = z.infer<typeof pinSchema>;
export { userCreateSchema, moodSchema, tagSchema, journalSchema, pinSchema };

export type { userCreateType, moodType, pinType, journalType, tagType };

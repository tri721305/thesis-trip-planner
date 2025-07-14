import { Blog } from "@/database";
import action from "../handler/action";
import { createBlogSchema } from "../validation";

export async function createBlog(params: any): Promise<ActionResponse<Blog>> {
  const validationResult = await action({
    params,
    schema: createBlogSchema,
    authorize: true,
  });

  return { success: true, data: {} };
}

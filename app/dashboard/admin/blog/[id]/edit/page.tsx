import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import BlogEditor from "@/components/admin/blog/BlogEditor";

type EditBlogPageProps = {
  params: {
    id: string;
  };
};

export default async function EditBlogPage({
  params,
}: EditBlogPageProps) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      category:blog_categories (
        id,
        name,
        slug
      ),
      blog_post_tags (
        tag_id,
        tag:blog_tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  const initialData = {
    ...post,

    selected_tag_ids:
      post.blog_post_tags?.map(
        (item: any) => item.tag_id
      ) || [],
  };

  return (
    <BlogEditor
      mode="edit"
      initialData={initialData}
    />
  );
}
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import CurrentAffairEditor, {
  CurrentAffairInitialData,
} from "@/components/admin/current-affairs/CurrentAffairEditor";

type Props = {
  params: {
    id: string;
  };
};

export default async function EditCurrentAffairPage({
  params,
}: Props) {
  const supabase =
    await createClient();

  const { data: affair, error } =
    await supabase
      .from("current_affairs")
      .select(`
        id,
        title,
        slug,
        short_description,
        content,
        featured_image,
        featured_image_alt,
        affair_date,
        source_name,
        source_url,
        category_id,
        status,
        published_at,
        scheduled_at,
        meta_title,
        meta_description,
        focus_keyword,
        canonical_url,
        og_title,
        og_description,
        og_image,
        twitter_title,
        twitter_description,
        twitter_image,
        robots_index,
        robots_follow,
        schema_type,
        reading_time
      `)
      .eq("id", params.id)
      .maybeSingle();

  if (error || !affair) {
    notFound();
  }

  const [
    factsResult,
    examsResult,
    tagsResult,
  ] = await Promise.all([
    supabase
      .from("current_affairs_facts")
      .select(
        "id,fact_text"
      )
      .eq(
        "affair_id",
        params.id
      )
      .order("display_order"),

    supabase
      .from(
        "current_affairs_exam_tags"
      )
      .select("exam_name")
      .eq(
        "affair_id",
        params.id
      )
      .order("exam_name"),

    supabase
      .from(
        "current_affairs_post_tags"
      )
      .select("tag_id")
      .eq(
        "affair_id",
        params.id
      ),
  ]);

  const initialData: CurrentAffairInitialData =
    {
      ...affair,

      facts:
        factsResult.data || [],

      exam_tags:
        (examsResult.data || []).map(
          (item) =>
            item.exam_name
        ),

      tag_ids:
        (tagsResult.data || []).map(
          (item) =>
            item.tag_id
        ),
    };

  return (
    <CurrentAffairEditor
      mode="edit"
      initialData={
        initialData
      }
    />
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Search,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type CurrentAffairInitialData = {
  id: string;

  title: string;
  slug: string;

  short_description: string | null;
  content: string;

  featured_image: string | null;
  featured_image_alt: string | null;

  affair_date: string;

  source_name: string | null;
  source_url: string | null;

  category_id: string | null;

  status: string;

  published_at: string | null;
  scheduled_at: string | null;

  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;

  og_title: string | null;
  og_description: string | null;
  og_image: string | null;

  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;

  robots_index: boolean;
  robots_follow: boolean;

  schema_type: string;

  reading_time: number;

  facts: {
    id?: string;
    fact_text: string;
  }[];

  exam_tags: string[];

  tag_ids: string[];
};

type Props = {
  mode: "create" | "edit";
  initialData?: CurrentAffairInitialData;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function calculateReadingTime(
  text: string
) {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 200)
  );
}

export default function CurrentAffairEditor({
  mode,
  initialData,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(
    initialData?.title || ""
  );

  const [slug, setSlug] = useState(
    initialData?.slug || ""
  );

  const [shortDescription, setShortDescription] =
    useState(
      initialData?.short_description || ""
    );

  const [content, setContent] = useState(
    initialData?.content || ""
  );

  const [affairDate, setAffairDate] =
    useState(
      initialData?.affair_date ||
        new Date()
          .toISOString()
          .slice(0, 10)
    );

  const [categoryId, setCategoryId] =
    useState(
      initialData?.category_id || ""
    );

  const [sourceName, setSourceName] =
    useState(
      initialData?.source_name || ""
    );

  const [sourceUrl, setSourceUrl] =
    useState(
      initialData?.source_url || ""
    );

  const [featuredImage, setFeaturedImage] =
    useState(
      initialData?.featured_image || ""
    );

  const [featuredImageAlt, setFeaturedImageAlt] =
    useState(
      initialData?.featured_image_alt || ""
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [selectedTags, setSelectedTags] =
    useState<string[]>(
      initialData?.tag_ids || []
    );

  const [facts, setFacts] =
    useState<
      { id?: string; fact_text: string }[]
    >(
      initialData?.facts?.length
        ? initialData.facts
        : [{ fact_text: "" }]
    );

  const [examTags, setExamTags] =
    useState<string[]>(
      initialData?.exam_tags || []
    );

  const [newExam, setNewExam] =
    useState("");

  const [status, setStatus] =
    useState(
      initialData?.status || "draft"
    );

  const [scheduledAt, setScheduledAt] =
    useState(
      initialData?.scheduled_at || ""
    );

  // SEO

  const [metaTitle, setMetaTitle] =
    useState(
      initialData?.meta_title || ""
    );

  const [metaDescription, setMetaDescription] =
    useState(
      initialData?.meta_description || ""
    );

  const [focusKeyword, setFocusKeyword] =
    useState(
      initialData?.focus_keyword || ""
    );

  const [canonicalUrl, setCanonicalUrl] =
    useState(
      initialData?.canonical_url || ""
    );

  const [ogTitle, setOgTitle] =
    useState(
      initialData?.og_title || ""
    );

  const [ogDescription, setOgDescription] =
    useState(
      initialData?.og_description || ""
    );

  const [ogImage, setOgImage] =
    useState(
      initialData?.og_image || ""
    );

  const [twitterTitle, setTwitterTitle] =
    useState(
      initialData?.twitter_title || ""
    );

  const [
    twitterDescription,
    setTwitterDescription,
  ] = useState(
    initialData?.twitter_description || ""
  );

  const [twitterImage, setTwitterImage] =
    useState(
      initialData?.twitter_image || ""
    );

  const [robotsIndex, setRobotsIndex] =
    useState(
      initialData?.robots_index ?? true
    );

  const [robotsFollow, setRobotsFollow] =
    useState(
      initialData?.robots_follow ?? true
    );

  const [schemaType, setSchemaType] =
    useState(
      initialData?.schema_type ||
        "Article"
    );

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const readingTime = useMemo(
    () =>
      calculateReadingTime(content),
    [content]
  );

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  async function loadCategories() {
    const { data, error } =
      await supabase
        .from(
          "current_affairs_categories"
        )
        .select("id,name,slug")
        .eq("is_active", true)
        .order("display_order")
        .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data || []);
  }

  async function loadTags() {
    const { data, error } =
      await supabase
        .from("current_affairs_tags")
        .select("id,name,slug")
        .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setTags(data || []);
  }

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (mode === "create") {
      setSlug(slugify(value));
    }
  }

  function toggleTag(
    id: string
  ) {
    setSelectedTags((current) =>
      current.includes(id)
        ? current.filter(
            (x) => x !== id
          )
        : [...current, id]
    );
  }

  function addFact() {
    setFacts((current) => [
      ...current,
      {
        fact_text: "",
      },
    ]);
  }

  function updateFact(
    index: number,
    value: string
  ) {
    setFacts((current) =>
      current.map((fact, i) =>
        i === index
          ? {
              ...fact,
              fact_text: value,
            }
          : fact
      )
    );
  }

  function removeFact(
    index: number
  ) {
    setFacts((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  function addExam() {
    const value =
      newExam.trim();

    if (!value) return;

    if (
      !examTags.includes(value)
    ) {
      setExamTags((current) => [
        ...current,
        value,
      ]);
    }

    setNewExam("");
  }

  function removeExam(
    value: string
  ) {
    setExamTags((current) =>
      current.filter(
        (exam) => exam !== value
      )
    );
  }

  async function uploadImage(
    file: File
  ) {
    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be smaller than 5MB."
      );
      return;
    }

    try {
      setUploading(true);

      const extension =
        file.name
          .split(".")
          .pop() ||
        "jpg";

      const fileName = `current-affairs/${crypto.randomUUID()}.${extension}`;

      const { error } =
        await supabase.storage
          .from("blog-images")
          .upload(
            fileName,
            file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                file.type,
            }
          );

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: publicData,
      } = supabase.storage
        .from("blog-images")
        .getPublicUrl(
          fileName
        );

      setFeaturedImage(
        publicData.publicUrl
      );
    } finally {
      setUploading(false);
    }
  }

  async function save(
    publish = false
  ) {
    if (!title.trim()) {
      alert(
        "Please enter a title."
      );
      return;
    }

    if (!slug.trim()) {
      alert(
        "Please enter a slug."
      );
      return;
    }

    if (!content.trim()) {
      alert(
        "Please enter article content."
      );
      return;
    }

    if (!categoryId) {
      alert(
        "Please select a category."
      );
      return;
    }

    try {
      setSaving(true);

      const finalStatus =
        publish
          ? "published"
          : status;

      const finalMetaTitle =
        metaTitle.trim() ||
        title.trim();

      const finalMetaDescription =
        metaDescription.trim() ||
        shortDescription.trim();

      const payload = {
        title: title.trim(),

        slug: slugify(slug),

        short_description:
          shortDescription.trim() ||
          null,

        content,

        featured_image:
          featuredImage.trim() ||
          null,

        featured_image_alt:
          featuredImageAlt.trim() ||
          title.trim(),

        affair_date:
          affairDate,

        category_id:
          categoryId || null,

        source_name:
          sourceName.trim() ||
          null,

        source_url:
          sourceUrl.trim() ||
          null,

        status:
          finalStatus,

        published_at:
          publish
            ? new Date().toISOString()
            : initialData?.published_at ||
              null,

        scheduled_at:
          scheduledAt || null,

        meta_title:
          finalMetaTitle,

        meta_description:
          finalMetaDescription,

        focus_keyword:
          focusKeyword.trim() ||
          null,

        canonical_url:
          canonicalUrl.trim() ||
          null,

        og_title:
          ogTitle.trim() ||
          finalMetaTitle,

        og_description:
          ogDescription.trim() ||
          finalMetaDescription,

        og_image:
          ogImage.trim() ||
          featuredImage.trim() ||
          null,

        twitter_title:
          twitterTitle.trim() ||
          finalMetaTitle,

        twitter_description:
          twitterDescription.trim() ||
          finalMetaDescription,

        twitter_image:
          twitterImage.trim() ||
          ogImage.trim() ||
          featuredImage.trim() ||
          null,

        robots_index:
          robotsIndex,

        robots_follow:
          robotsFollow,

        schema_type:
          schemaType,

        reading_time:
          readingTime,
      };

      let affairId =
        initialData?.id;

      if (mode === "create") {
        const {
          data,
          error,
        } = await supabase
          .from(
            "current_affairs"
          )
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          alert(error.message);
          return;
        }

        affairId = data.id;
      } else {
        const { error } =
          await supabase
            .from(
              "current_affairs"
            )
            .update(payload)
            .eq(
              "id",
              initialData!.id
            );

        if (error) {
          alert(error.message);
          return;
        }
      }

      if (!affairId) {
        alert(
          "Could not determine article ID."
        );
        return;
      }

      // ----------------------------------------
      // Replace facts
      // ----------------------------------------

      await supabase
        .from(
          "current_affairs_facts"
        )
        .delete()
        .eq(
          "affair_id",
          affairId
        );

      const cleanFacts =
        facts.filter(
          (fact) =>
            fact.fact_text.trim()
        );

      if (
        cleanFacts.length > 0
      ) {
        const rows =
          cleanFacts.map(
            (
              fact,
              index
            ) => ({
              affair_id:
                affairId,
              fact_text:
                fact.fact_text.trim(),
              display_order:
                index,
            })
          );

        const {
          error: factError,
        } = await supabase
          .from(
            "current_affairs_facts"
          )
          .insert(rows);

        if (factError) {
          console.error(
            factError
          );
        }
      }

      // ----------------------------------------
      // Replace exam tags
      // ----------------------------------------

      await supabase
        .from(
          "current_affairs_exam_tags"
        )
        .delete()
        .eq(
          "affair_id",
          affairId
        );

      if (
        examTags.length > 0
      ) {
        const rows =
          examTags.map(
            (exam) => ({
              affair_id:
                affairId,
              exam_name:
                exam,
            })
          );

        const {
          error: examError,
        } = await supabase
          .from(
            "current_affairs_exam_tags"
          )
          .insert(rows);

        if (examError) {
          console.error(
            examError
          );
        }
      }

      // ----------------------------------------
      // Replace tags
      // ----------------------------------------

      await supabase
        .from(
          "current_affairs_post_tags"
        )
        .delete()
        .eq(
          "affair_id",
          affairId
        );

      if (
        selectedTags.length > 0
      ) {
        const rows =
          selectedTags.map(
            (tagId) => ({
              affair_id:
                affairId,
              tag_id:
                tagId,
            })
          );

        const {
          error: tagError,
        } = await supabase
          .from(
            "current_affairs_post_tags"
          )
          .insert(rows);

        if (tagError) {
          console.error(
            tagError
          );
        }
      }

      alert(
        publish
          ? "Current affair published successfully."
          : "Current affair saved successfully."
      );

      router.push(
        "/dashboard/admin/current-affairs"
      );

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-7xl">

        {/* TOP */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/admin/current-affairs"
                )
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#063B8F]"
            >
              <ArrowLeft size={16} />
              Back to Current Affairs
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              {mode === "create"
                ? "Create Current Affair"
                : "Edit Current Affair"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create exam-focused current affairs with SEO.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                save(false)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              <Save size={17} />
              Save Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                save(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Send size={17} />
              Publish
            </button>

          </div>

        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* MAIN */}

          <div className="space-y-6">

            {/* BASIC */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Article Information
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      handleTitleChange(
                        e.target.value
                      )
                    }
                    placeholder="Enter current affair title"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold outline-none focus:border-[#063B8F]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Slug
                  </label>

                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        slugify(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    /current-affairs/{slug || "your-slug"}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Affair Date
                    </label>

                    <input
                      type="date"
                      value={affairDate}
                      onChange={(e) =>
                        setAffairDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Category
                    </label>

                    <select
                      value={categoryId}
                      onChange={(e) =>
                        setCategoryId(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Short Description
                  </label>

                  <textarea
                    value={
                      shortDescription
                    }
                    onChange={(e) =>
                      setShortDescription(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Short summary for cards and SEO..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
                  />
                </div>

              </div>

            </section>

            {/* CONTENT */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="mb-4 flex items-center justify-between">

                <h2 className="text-lg font-bold text-slate-900">
                  Article Content
                </h2>

                <span className="text-xs text-slate-500">
                  {readingTime} min read
                </span>

              </div>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(
                    e.target.value
                  )
                }
                rows={24}
                placeholder={`Why in News?

Write the current affair here...

Key information...

Important details...`}
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-7 outline-none focus:border-[#063B8F]"
              />

              <p className="mt-2 text-xs text-slate-500">
                Rich-text editor can be added next. This version safely stores plain article text.
              </p>

            </section>

            {/* FACTS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Important Facts
                  </h2>

                  <p className="text-sm text-slate-500">
                    Facts students should remember for exams.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addFact}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#063B8F]"
                >
                  <Plus size={16} />
                  Add Fact
                </button>

              </div>

              <div className="space-y-3">

                {facts.map(
                  (
                    fact,
                    index
                  ) => (
                    <div
                      key={index}
                      className="flex gap-3"
                    >

                      <textarea
                        value={
                          fact.fact_text
                        }
                        onChange={(e) =>
                          updateFact(
                            index,
                            e.target.value
                          )
                        }
                        rows={2}
                        placeholder={`Important fact ${index + 1}`}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeFact(
                            index
                          )
                        }
                        className="h-10 rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* EXAMS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Exam Relevance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Which exams can use this current affair?
              </p>

              <div className="mt-4 flex gap-2">

                <input
                  value={newExam}
                  onChange={(e) =>
                    setNewExam(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();
                      addExam();
                    }
                  }}
                  placeholder="e.g. SSC CGL"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

                <button
                  type="button"
                  onClick={addExam}
                  className="rounded-xl bg-slate-900 px-4 text-white"
                >
                  Add
                </button>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                {examTags.map(
                  (exam) => (
                    <span
                      key={exam}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#063B8F]"
                    >
                      {exam}

                      <button
                        type="button"
                        onClick={() =>
                          removeExam(
                            exam
                          )
                        }
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )
                )}

              </div>

            </section>

            {/* SOURCE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Source
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Source Name
                  </label>

                  <input
                    value={sourceName}
                    onChange={(e) =>
                      setSourceName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. PIB"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Source URL
                  </label>

                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) =>
                      setSourceUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>

              </div>

            </section>

            {/* IMAGE */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">

              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Featured Image
              </h2>

              {featuredImage ? (

                <div className="relative overflow-hidden rounded-xl border border-slate-200">

                  <img
                    src={featuredImage}
                    alt={
                      featuredImageAlt ||
                      title
                    }
                    className="max-h-[350px] w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setFeaturedImage(
                        ""
                      )
                    }
                    className="absolute right-3 top-3 rounded-lg bg-white p-2 text-red-500 shadow"
                  >
                    <X size={17} />
                  </button>

                </div>

              ) : (

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-14 text-center hover:border-[#063B8F]">

                  <ImageIcon
                    size={36}
                    className="text-slate-300"
                  />

                  <span className="mt-3 text-sm font-semibold text-slate-700">
                    {uploading
                      ? "Uploading..."
                      : "Upload featured image"}
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Max 5MB
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={
                      uploading
                    }
                    onChange={(e) => {
                      const file =
                        e.target
                          .files?.[0];

                      if (file) {
                        uploadImage(
                          file
                        );
                      }
                    }}
                  />

                </label>

              )}

              <div className="mt-4">

                <label className="mb-2 block text-sm font-semibold">
                  Image Alt Text
                </label>

                <input
                  value={
                    featuredImageAlt
                  }
                  onChange={(e) =>
                    setFeaturedImageAlt(
                      e.target.value
                    )
                  }
                  placeholder="Describe the image"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />

              </div>

            </section>

          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* PUBLISH */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">

              <h2 className="mb-4 font-bold text-slate-900">
                Publish
              </h2>

              <label className="mb-2 block text-sm font-semibold">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="unpublished">
                  Unpublished
                </option>

                <option value="scheduled">
                  Scheduled
                </option>
              </select>

              {status ===
                "scheduled" && (
                <div className="mt-4">

                  <label className="mb-2 block text-sm font-semibold">
                    Schedule Date
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      scheduledAt
                    }
                    onChange={(e) =>
                      setScheduledAt(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />

                </div>
              )}

            </section>

            {/* TAGS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">

              <h2 className="mb-4 font-bold text-slate-900">
                Tags
              </h2>

              {tags.length ===
              0 ? (

                <p className="text-sm text-slate-500">
                  No tags available.
                </p>

              ) : (

                <div className="space-y-2">

                  {tags.map(
                    (tag) => (
                      <label
                        key={tag.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                      >

                        <input
                          type="checkbox"
                          checked={selectedTags.includes(
                            tag.id
                          )}
                          onChange={() =>
                            toggleTag(
                              tag.id
                            )
                          }
                        />

                        <span className="text-sm">
                          {tag.name}
                        </span>

                      </label>
                    )
                  )}

                </div>

              )}

            </section>

            {/* SEO */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">

              <h2 className="mb-5 font-bold text-slate-900">
                SEO
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    SEO Title
                  </label>

                  <input
                    value={metaTitle}
                    onChange={(e) =>
                      setMetaTitle(
                        e.target.value
                      )
                    }
                    maxLength={60}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {metaTitle.length}/60
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Meta Description
                  </label>

                  <textarea
                    value={
                      metaDescription
                    }
                    onChange={(e) =>
                      setMetaDescription(
                        e.target.value
                      )
                    }
                    maxLength={160}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {metaDescription.length}/160
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Focus Keyword
                  </label>

                  <input
                    value={
                      focusKeyword
                    }
                    onChange={(e) =>
                      setFocusKeyword(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Canonical URL
                  </label>

                  <input
                    value={
                      canonicalUrl
                    }
                    onChange={(e) =>
                      setCanonicalUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">
                    Schema Type
                  </label>

                  <select
                    value={
                      schemaType
                    }
                    onChange={(e) =>
                      setSchemaType(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  >
                    <option value="Article">
                      Article
                    </option>

                    <option value="NewsArticle">
                      NewsArticle
                    </option>
                  </select>
                </div>

                <div className="space-y-3">

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        robotsIndex
                      }
                      onChange={(e) =>
                        setRobotsIndex(
                          e.target
                            .checked
                        )
                      }
                    />

                    Allow search indexing
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        robotsFollow
                      }
                      onChange={(e) =>
                        setRobotsFollow(
                          e.target
                            .checked
                        )
                      }
                    />

                    Allow search engines to follow links
                  </label>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>
    </DashboardShell>
  );
}
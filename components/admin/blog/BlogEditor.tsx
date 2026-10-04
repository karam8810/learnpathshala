"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import BlogSeoPanel from "./BlogSeoPanel";

/* ============================================================
   TYPES
============================================================ */

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

type BlogEditorProps = {
  mode: "create" | "edit";
  initialData?: any;
};

/* ============================================================
   HELPERS
============================================================ */

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

function calculateReadingTime(text: string) {
  const cleanText = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleanText
    ? cleanText.split(" ").length
    : 0;

  return Math.max(
    1,
    Math.ceil(words / 200)
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function BlogEditor({
  mode,
  initialData,
}: BlogEditorProps) {
  const router = useRouter();

  /* ==========================================================
     BASIC STATE
  ========================================================== */

  const [saving, setSaving] = useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [tags, setTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState(
    initialData?.title || ""
  );

  const [slug, setSlug] = useState(
    initialData?.slug || ""
  );

  const [excerpt, setExcerpt] = useState(
    initialData?.excerpt || ""
  );

  const [content, setContent] = useState(
    initialData?.content || ""
  );

  /* ==========================================================
     FEATURED IMAGE
  ========================================================== */

  const [featuredImage, setFeaturedImage] =
    useState<string>(
      initialData?.featured_image || ""
    );

  const [featuredImageAlt, setFeaturedImageAlt] =
    useState<string>(
      initialData?.featured_image_alt || ""
    );

  const [imageUploading, setImageUploading] =
    useState(false);

  /* ==========================================================
     CATEGORY / TAGS
  ========================================================== */

  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || ""
  );

  const [selectedTags, setSelectedTags] =
    useState<string[]>(
      initialData?.selected_tag_ids || []
    );

  /* ==========================================================
     PUBLISH
  ========================================================== */

  const [status, setStatus] = useState(
    initialData?.status || "draft"
  );

  /* ==========================================================
     SEO
  ========================================================== */

  const [metaTitle, setMetaTitle] = useState(
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

  const [ogTitle, setOgTitle] = useState(
    initialData?.og_title || ""
  );

  const [ogDescription, setOgDescription] =
    useState(
      initialData?.og_description || ""
    );

  const [ogImage, setOgImage] = useState(
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

  /* ==========================================================
     READING TIME
  ========================================================== */

  const readingTime = useMemo(
    () => calculateReadingTime(content),
    [content]
  );

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("blog_categories")
      .select("id,name,slug")
      .order("name");

    if (error) {
      console.error(
        "Category loading error:",
        error
      );
      return;
    }

    setCategories(data || []);
  }

  async function loadTags() {
    const { data, error } = await supabase
      .from("blog_tags")
      .select("id,name,slug")
      .order("name");

    if (error) {
      console.error(
        "Tag loading error:",
        error
      );
      return;
    }

    setTags(data || []);
  }

  /* ==========================================================
     TITLE
  ========================================================== */

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (mode === "create") {
      setSlug(slugify(value));
    }
  }

  /* ==========================================================
     TAGS
  ========================================================== */

  function toggleTag(id: string) {
    setSelectedTags((current) =>
      current.includes(id)
        ? current.filter(
            (tagId) => tagId !== id
          )
        : [...current, id]
    );
  }

  /* ==========================================================
     FEATURED IMAGE UPLOAD
  ========================================================== */

  async function uploadFeaturedImage(
    file: File
  ) {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Invalid image format. Please upload JPG, PNG or WebP."
      );
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Image size must be less than 5 MB."
      );
      return;
    }

    try {
      setImageUploading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "Your session has expired. Please login again."
        );
        return;
      }

      /*
       * Generate unique file name.
       *
       * Example:
       *
       * blog-images/
       *   USER_ID/
       *     7f8c....png
       */

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath =
        `${user.id}/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("blog-images")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        console.error(
          "Supabase image upload error:",
          uploadError
        );

        alert(
          `Image upload failed: ${uploadError.message}`
        );

        return;
      }

      /*
       * Get public URL
       */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        alert(
          "Image uploaded but public URL could not be generated."
        );
        return;
      }

      /*
       * Save URL in React state.
       *
       * It will be saved into:
       *
       * blog_posts.featured_image
       */

      setFeaturedImage(
        publicUrlData.publicUrl
      );

      /*
       * Automatically use file name as
       * initial alt text if empty.
       */

      if (!featuredImageAlt.trim()) {
        const cleanName =
          file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .trim();

        setFeaturedImageAlt(
          cleanName
        );
      }
    } catch (error) {
      console.error(
        "Unexpected image upload error:",
        error
      );

      alert(
        "Something went wrong while uploading the image."
      );
    } finally {
      setImageUploading(false);
    }
  }

  /* ==========================================================
     REMOVE FEATURED IMAGE
  ========================================================== */

  async function removeFeaturedImage() {
    if (!featuredImage) return;

    const confirmed =
      window.confirm(
        "Remove this featured image?"
      );

    if (!confirmed) return;

    /*
     * We remove the URL from the post.
     *
     * The storage file can remain because the
     * image might already be used by another
     * post/version.
     */

    setFeaturedImage("");
    setFeaturedImageAlt("");
  }

  /* ==========================================================
     SAVE POST
  ========================================================== */

  async function savePost(
    publish = false
  ) {
    if (imageUploading) {
      alert(
        "Please wait until the image upload is complete."
      );
      return;
    }

    if (!title.trim()) {
      alert(
        "Please enter a blog title."
      );
      return;
    }

    if (!slug.trim()) {
      alert(
        "Please enter a blog slug."
      );
      return;
    }

    if (!content.trim()) {
      alert(
        "Please enter blog content."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Your session has expired. Please login again."
        );
        return;
      }

      const finalStatus = publish
        ? "published"
        : status;

      const payload = {
        title: title.trim(),

        slug: slugify(slug),

        excerpt:
          excerpt.trim() || null,

        content,

        featured_image:
          featuredImage.trim() || null,

        featured_image_alt:
          featuredImageAlt.trim() || null,

        author_id:
          initialData?.author_id ||
          user.id,

        category_id:
          categoryId || null,

        status: finalStatus,

        published_at:
          finalStatus === "published"
            ? initialData?.published_at ||
              new Date().toISOString()
            : initialData?.published_at ||
              null,

        meta_title:
          metaTitle.trim() ||
          title.trim(),

        meta_description:
          metaDescription.trim() ||
          excerpt.trim() ||
          null,

        focus_keyword:
          focusKeyword.trim() ||
          null,

        canonical_url:
          canonicalUrl.trim() ||
          null,

        og_title:
          ogTitle.trim() ||
          metaTitle.trim() ||
          title.trim(),

        og_description:
          ogDescription.trim() ||
          metaDescription.trim() ||
          excerpt.trim() ||
          null,

        og_image:
          ogImage.trim() ||
          featuredImage.trim() ||
          null,

        twitter_title:
          twitterTitle.trim() ||
          metaTitle.trim() ||
          title.trim(),

        twitter_description:
          twitterDescription.trim() ||
          metaDescription.trim() ||
          excerpt.trim() ||
          null,

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

      let postId =
        initialData?.id;

      /* ======================================================
         CREATE
      ====================================================== */

      if (mode === "create") {
        const {
          data,
          error,
        } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          console.error(
            "Blog create error:",
            error
          );

          alert(error.message);
          return;
        }

        postId = data.id;
      }

      /* ======================================================
         UPDATE
      ====================================================== */

      else {
        const {
          error,
        } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq(
            "id",
            initialData.id
          );

        if (error) {
          console.error(
            "Blog update error:",
            error
          );

          alert(error.message);
          return;
        }
      }

      /* ======================================================
         UPDATE TAGS
      ====================================================== */

      await supabase
        .from("blog_post_tags")
        .delete()
        .eq(
          "post_id",
          postId
        );

      if (
        selectedTags.length > 0 &&
        postId
      ) {
        const tagRows =
          selectedTags.map(
            (tagId) => ({
              post_id: postId,
              tag_id: tagId,
            })
          );

        const {
          error: tagError,
        } = await supabase
          .from("blog_post_tags")
          .insert(tagRows);

        if (tagError) {
          console.error(
            "Tag insert error:",
            tagError
          );
        }
      }

      alert(
        publish
          ? "Blog published successfully."
          : "Blog saved successfully."
      );

      router.push(
        "/dashboard/admin/blog"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Save blog error:",
        error
      );

      alert(
        "Something went wrong while saving the blog."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/admin/blog"
                )
              }
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#063B8F]"
            >
              <ArrowLeft size={16} />

              Back to Blog
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              {mode === "create"
                ? "Create Blog Post"
                : "Edit Blog Post"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create SEO-friendly content
              for LearnPathshala.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {/* PREVIEW */}

            {initialData?.slug && (
              <a
                href={`/blog/${initialData.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Eye size={16} />

                Preview
              </a>
            )}

            {/* SAVE */}

            <button
              type="button"
              disabled={
                saving ||
                imageUploading
              }
              onClick={() =>
                savePost(false)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Save size={16} />
              )}

              Save Draft
            </button>

            {/* PUBLISH */}

            <button
              type="button"
              disabled={
                saving ||
                imageUploading
              }
              onClick={() =>
                savePost(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#052f70] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}

              Publish
            </button>
          </div>
        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-6">

            {/* =================================================
                BLOG CONTENT
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-lg font-bold text-slate-900">
                Blog Content
              </h2>

              <div className="space-y-5">

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Title *
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      handleTitleChange(
                        e.target.value
                      )
                    }
                    placeholder="SSC CGL Admit Card 2026 Released..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* SLUG */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Slug *
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
                    placeholder="ssc-cgl-admit-card-2026"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    URL: /blog/
                    {slug ||
                      "your-slug"}
                  </p>
                </div>

                {/* EXCERPT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Excerpt
                  </label>

                  <textarea
                    value={excerpt}
                    onChange={(e) =>
                      setExcerpt(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Short description of the article..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CONTENT */}

                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Content *
                    </label>

                    <span className="text-xs text-slate-400">
                      ~{readingTime} min
                      read
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
                    placeholder={`Write your blog article here...

Example:

SSC CGL Admit Card 2026 has been released...

Important Dates

- Application date
- Admit card date
- Examination date

How to Download SSC CGL Admit Card

1. Visit the official website
2. Login
3. Download admit card

Write useful, original and structured information.`}
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Rich text editor can be
                    added separately. Your
                    current article content is
                    stored safely in the database.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                FEATURED IMAGE
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Featured Image
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload an image from your
                  computer.
                  Recommended size:
                  1200 × 630px.
                </p>
              </div>

              <div className="space-y-5">

                {/* ============================================
                    NO IMAGE
                ============================================ */}

                {!featuredImage ? (

                  <label
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                      imageUploading
                        ? "cursor-wait border-blue-200 bg-blue-50"
                        : "border-slate-300 bg-slate-50 hover:border-[#063B8F] hover:bg-blue-50"
                    }`}
                  >

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">

                      {imageUploading ? (
                        <Loader2
                          size={26}
                          className="animate-spin text-[#063B8F]"
                        />
                      ) : (
                        <Upload
                          size={26}
                          className="text-[#063B8F]"
                        />
                      )}

                    </div>

                    <h3 className="text-sm font-semibold text-slate-800">
                      {imageUploading
                        ? "Uploading image..."
                        : "Upload blog image"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG or WebP
                      · Maximum 5MB
                    </p>

                    {!imageUploading && (
                      <span className="mt-4 rounded-xl bg-[#063B8F] px-4 py-2 text-sm font-semibold text-white">
                        Choose Image
                      </span>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={
                        imageUploading ||
                        saving
                      }
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (file) {
                          uploadFeaturedImage(
                            file
                          );
                        }

                        e.target.value = "";
                      }}
                    />
                  </label>

                ) : (

                  /* ==========================================
                     IMAGE PREVIEW
                  ========================================== */

                  <div className="overflow-hidden rounded-2xl border border-slate-200">

                    <div className="relative">

                      <img
                        src={featuredImage}
                        alt={
                          featuredImageAlt ||
                          title ||
                          "Blog featured image"
                        }
                        className="aspect-video w-full object-cover"
                      />

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={
                          removeFeaturedImage
                        }
                        disabled={
                          imageUploading
                        }
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                        title="Remove image"
                      >
                        <X size={18} />
                      </button>

                    </div>

                    {/* IMAGE INFO */}

                    <div className="flex items-center justify-between bg-slate-50 px-4 py-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <ImageIcon
                          size={18}
                          className="shrink-0 text-green-600"
                        />

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-slate-700">
                            Image uploaded
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            Supabase Storage
                          </p>

                        </div>
                      </div>

                      {/* CHANGE */}

                      <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">

                        <span className="flex items-center gap-1.5">
                          <RefreshCw
                            size={13}
                          />

                          Change
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          disabled={
                            imageUploading ||
                            saving
                          }
                          onChange={(e) => {
                            const file =
                              e.target.files?.[0];

                            if (file) {
                              uploadFeaturedImage(
                                file
                              );
                            }

                            e.target.value =
                              "";
                          }}
                        />

                      </label>

                    </div>
                  </div>
                )}

                {/* ALT TEXT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Image Alt Text
                  </label>

                  <input
                    value={featuredImageAlt}
                    onChange={(e) =>
                      setFeaturedImageAlt(
                        e.target.value
                      )
                    }
                    placeholder={
                      title ||
                      "Describe the featured image"
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Use descriptive alt text for
                    accessibility and SEO.
                  </p>
                </div>

              </div>
            </section>

            {/* =================================================
                SEO
            ================================================= */}

            <BlogSeoPanel
              metaTitle={metaTitle}
              setMetaTitle={
                setMetaTitle
              }

              metaDescription={
                metaDescription
              }
              setMetaDescription={
                setMetaDescription
              }

              focusKeyword={
                focusKeyword
              }
              setFocusKeyword={
                setFocusKeyword
              }

              canonicalUrl={
                canonicalUrl
              }
              setCanonicalUrl={
                setCanonicalUrl
              }

              ogTitle={ogTitle}
              setOgTitle={setOgTitle}

              ogDescription={
                ogDescription
              }
              setOgDescription={
                setOgDescription
              }

              ogImage={ogImage}
              setOgImage={setOgImage}

              twitterTitle={
                twitterTitle
              }
              setTwitterTitle={
                setTwitterTitle
              }

              twitterDescription={
                twitterDescription
              }
              setTwitterDescription={
                setTwitterDescription
              }

              twitterImage={
                twitterImage
              }
              setTwitterImage={
                setTwitterImage
              }

              robotsIndex={
                robotsIndex
              }
              setRobotsIndex={
                setRobotsIndex
              }

              robotsFollow={
                robotsFollow
              }
              setRobotsFollow={
                setRobotsFollow
              }

              schemaType={
                schemaType
              }
              setSchemaType={
                setSchemaType
              }

              title={title}

              excerpt={excerpt}

              featuredImage={
                featuredImage
              }
            />
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <div className="space-y-6">

            {/* PUBLISH SETTINGS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Publish Settings
              </h2>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="pending_review">
                  Pending Review
                </option>

                <option value="scheduled">
                  Scheduled
                </option>

                <option value="published">
                  Published
                </option>

                <option value="unpublished">
                  Unpublished
                </option>
              </select>
            </section>

            {/* CATEGORY */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Category
              </h2>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              >
                <option value="">
                  Select Category
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
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>
            </section>

            {/* TAGS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Tags
              </h2>

              {tags.length === 0 ? (

                <p className="text-sm text-slate-400">
                  No tags created yet.
                </p>

              ) : (

                <div className="max-h-72 space-y-2 overflow-y-auto">

                  {tags.map((tag) => (

                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
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
                        className="h-4 w-4 rounded border-slate-300"
                      />

                      <span className="text-sm text-slate-700">
                        {tag.name}
                      </span>

                    </label>

                  ))}

                </div>
              )}
            </section>

            {/* SEO CHECKLIST */}

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="mb-3 text-base font-bold text-[#063B8F]">
                SEO Checklist
              </h2>

              <div className="space-y-2 text-sm">

                <Checklist
                  done={
                    title.length >= 20
                  }
                  text="Good blog title"
                />

                <Checklist
                  done={
                    metaTitle.length >=
                      30 &&
                    metaTitle.length <=
                      60
                  }
                  text="SEO title 30–60 characters"
                />

                <Checklist
                  done={
                    metaDescription.length >=
                      120 &&
                    metaDescription.length <=
                      160
                  }
                  text="Meta description 120–160 characters"
                />

                <Checklist
                  done={
                    focusKeyword.length >
                    0
                  }
                  text="Focus keyword added"
                />

                <Checklist
                  done={
                    slug.length > 0
                  }
                  text="SEO-friendly URL"
                />

                <Checklist
                  done={
                    featuredImage.length >
                    0
                  }
                  text="Featured image added"
                />

              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ============================================================
   CHECKLIST
============================================================ */

function Checklist({
  done,
  text,
}: {
  done: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
          done
            ? "bg-green-500 text-white"
            : "bg-white text-slate-400"
        }`}
      >
        {done ? "✓" : "○"}
      </span>

      <span
        className={
          done
            ? "text-green-700"
            : "text-slate-600"
        }
      >
        {text}
      </span>

    </div>
  );
}
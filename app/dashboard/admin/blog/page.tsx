"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";

type BlogCategory = {
  name: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  category: BlogCategory | BlogCategory[] | null;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);

      let query = supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          slug,
          status,
          published_at,
          created_at,
          view_count,
          category:blog_categories (
            name
          )
        `)
        .neq("status", "trash")
        .order("created_at", {
          ascending: false,
        });

      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (search.trim()) {
        query = query.ilike(
          "title",
          `%${search.trim()}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Blog load error:", error);
        alert(error.message);
        return;
      }

      setPosts((data || []) as BlogPost[]);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    const confirmed = window.confirm(
      "Move this blog post to trash?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: "trash",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts();
  }

  async function togglePublish(post: BlogPost) {
    const newStatus =
      post.status === "published"
        ? "unpublished"
        : "published";

    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published"
            ? post.published_at ||
              new Date().toISOString()
            : post.published_at,
      })
      .eq("id", post.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPosts();
  }

  function getCategoryName(
    category: BlogPost["category"]
  ) {
    if (!category) return "Uncategorized";

    if (Array.isArray(category)) {
      return category[0]?.name || "Uncategorized";
    }

    return category.name || "Uncategorized";
  }

  function statusStyle(value: string) {
    switch (value) {
      case "published":
        return "bg-green-100 text-green-700";

      case "draft":
        return "bg-gray-100 text-gray-700";

      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "pending_review":
        return "bg-yellow-100 text-yellow-700";

      case "unpublished":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function statusLabel(value: string) {
    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#063B8F]">
                <FileText size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Blog
                </h1>

                <p className="text-sm text-slate-500">
                  Manage LearnPathshala blog content,
                  categories and SEO.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/admin/blog/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f70]"
          >
            <Plus size={18} />
            New Post
          </Link>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadPosts();
                  }
                }}
                placeholder="Search blog posts..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#063B8F] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);

                setTimeout(() => {
                  loadPosts();
                }, 0);
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            >
              <option value="all">
                All Status
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="pending_review">
                Pending Review
              </option>

              <option value="unpublished">
                Unpublished
              </option>
            </select>

            <button
              onClick={loadPosts}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Search
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2
                className="animate-spin text-[#063B8F]"
                size={28}
              />
            </div>
          ) : posts.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <FileText
                size={44}
                className="mx-auto mb-4 text-slate-300"
              />

              <h3 className="font-semibold text-slate-900">
                No blog posts found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first LearnPathshala
                blog post.
              </p>

              <Link
                href="/dashboard/admin/blog/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#063B8F] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Create Post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Post
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Views
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-[350px]">
                          <div className="truncate font-semibold text-slate-900">
                            {post.title}
                          </div>

                          <div className="mt-1 truncate text-xs text-slate-400">
                            /blog/{post.slug}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {getCategoryName(
                          post.category
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                            post.status
                          )}`}
                        >
                          {statusLabel(
                            post.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {post.view_count || 0}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(
                          post.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-[#063B8F]"
                            title="View"
                          >
                            <Eye size={17} />
                          </Link>

                          <Link
                            href={`/dashboard/admin/blog/${post.id}/edit`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-[#063B8F]"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </Link>

                          <button
                            onClick={() =>
                              togglePublish(post)
                            }
                            className="rounded-lg px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            {post.status ===
                            "published"
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            onClick={() =>
                              deletePost(post.id)
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                            title="Move to trash"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
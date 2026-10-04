"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  DashboardShell,
} from "@/components/dashboard-shell";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}

export default function CategoriesPage() {
  const [
    categories,
    setCategories,
  ] = useState<Category[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  );

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState("0");

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data, error } =
      await supabase
        .from(
          "current_affairs_categories"
        )
        .select("*")
        .order(
          "display_order"
        )
        .order("name");

    if (error) {
      alert(error.message);
    }

    setCategories(
      data || []
    );

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setDisplayOrder("0");
  }

  function editCategory(
    category: Category
  ) {
    setEditingId(
      category.id
    );

    setName(
      category.name
    );

    setDescription(
      category.description ||
        ""
    );

    setDisplayOrder(
      String(
        category.display_order
      )
    );
  }

  async function saveCategory() {
    if (!name.trim()) {
      alert(
        "Enter category name."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name:
          name.trim(),

        slug:
          slugify(
            name
          ),

        description:
          description.trim() ||
          null,

        display_order:
          Number(
            displayOrder
          ) || 0,
      };

      if (editingId) {
        const { error } =
          await supabase
            .from(
              "current_affairs_categories"
            )
            .update(payload)
            .eq(
              "id",
              editingId
            );

        if (error) {
          alert(
            error.message
          );
          return;
        }
      } else {
        const { error } =
          await supabase
            .from(
              "current_affairs_categories"
            )
            .insert(payload);

        if (error) {
          alert(
            error.message
          );
          return;
        }
      }

      resetForm();
      loadCategories();
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(
    category: Category
  ) {
    const { error } =
      await supabase
        .from(
          "current_affairs_categories"
        )
        .update({
          is_active:
            !category.is_active,
        })
        .eq(
          "id",
          category.id
        );

    if (error) {
      alert(error.message);
      return;
    }

    loadCategories();
  }

  async function deleteCategory(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this category?"
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(
          "current_affairs_categories"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (error) {
      alert(
        "Cannot delete this category if current affairs are using it. " +
          error.message
      );
      return;
    }

    loadCategories();
  }

  return (
    <DashboardShell role="admin">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-slate-900">
            Current Affairs Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage categories used by current affairs.
          </p>

        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">

          {/* FORM */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="font-bold text-slate-900">
                {editingId
                  ? "Edit Category"
                  : "New Category"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="text-slate-400"
                >
                  <X size={18} />
                </button>
              )}

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Display Order
                </label>

                <input
                  type="number"
                  value={
                    displayOrder
                  }
                  onChange={(e) =>
                    setDisplayOrder(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={
                  saveCategory
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063B8F] px-4 py-3 text-sm font-semibold text-white"
              >
                {editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {editingId
                  ? "Update Category"
                  : "Add Category"}
              </button>

            </div>

          </section>

          {/* LIST */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {loading ? (

              <div className="p-10 text-center text-sm text-slate-500">
                Loading...
              </div>

            ) : (

              <div className="divide-y divide-slate-100">

                {categories.map(
                  (category) => (
                    <div
                      key={
                        category.id
                      }
                      className="flex items-center justify-between gap-4 p-5"
                    >

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {
                            category.name
                          }
                        </h3>

                        <p className="text-xs text-slate-500">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {
                              category.description
                            }
                          </p>
                        )}

                      </div>

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            toggleCategory(
                              category
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            category.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.is_active
                            ? "Active"
                            : "Hidden"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            editCategory(
                              category
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-500"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCategory(
                              category.id
                            )
                          }
                          className="rounded-lg border border-red-100 p-2 text-red-500"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            )}

          </section>

        </div>

      </div>
    </DashboardShell>
  );
}
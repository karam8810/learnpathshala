"use client";

type BlogSeoPanelProps = {
  metaTitle: string;
  setMetaTitle: (value: string) => void;

  metaDescription: string;
  setMetaDescription: (value: string) => void;

  focusKeyword: string;
  setFocusKeyword: (value: string) => void;

  canonicalUrl: string;
  setCanonicalUrl: (value: string) => void;

  ogTitle: string;
  setOgTitle: (value: string) => void;

  ogDescription: string;
  setOgDescription: (value: string) => void;

  ogImage: string;
  setOgImage: (value: string) => void;

  twitterTitle: string;
  setTwitterTitle: (value: string) => void;

  twitterDescription: string;
  setTwitterDescription: (
    value: string
  ) => void;

  twitterImage: string;
  setTwitterImage: (value: string) => void;

  robotsIndex: boolean;
  setRobotsIndex: (value: boolean) => void;

  robotsFollow: boolean;
  setRobotsFollow: (value: boolean) => void;

  schemaType: string;
  setSchemaType: (value: string) => void;

  title: string;
  excerpt: string;
  featuredImage: string;
};

export default function BlogSeoPanel({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  focusKeyword,
  setFocusKeyword,
  canonicalUrl,
  setCanonicalUrl,
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  twitterTitle,
  setTwitterTitle,
  twitterDescription,
  setTwitterDescription,
  twitterImage,
  setTwitterImage,
  robotsIndex,
  setRobotsIndex,
  robotsFollow,
  setRobotsFollow,
  schemaType,
  setSchemaType,
  title,
  excerpt,
  featuredImage,
}: BlogSeoPanelProps) {
  const previewTitle =
    metaTitle || title || "Your Blog Title";

  const previewDescription =
    metaDescription ||
    excerpt ||
    "Your blog meta description will appear here.";

  const previewImage =
    ogImage ||
    featuredImage;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          SEO Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Optimize this article for Google and
          social media.
        </p>
      </div>

      <div className="space-y-7">
        {/* GOOGLE SEO */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Google Search
          </h3>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  SEO Title
                </label>

                <span
                  className={`text-xs ${
                    metaTitle.length > 60
                      ? "text-red-500"
                      : "text-slate-400"
                  }`}
                >
                  {metaTitle.length}/60
                </span>
              </div>

              <input
                value={metaTitle}
                onChange={(e) =>
                  setMetaTitle(
                    e.target.value
                  )
                }
                placeholder={
                  title ||
                  "SEO optimized title"
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Meta Description
                </label>

                <span
                  className={`text-xs ${
                    metaDescription.length >
                    160
                      ? "text-red-500"
                      : "text-slate-400"
                  }`}
                >
                  {metaDescription.length}/160
                </span>
              </div>

              <textarea
                value={metaDescription}
                onChange={(e) =>
                  setMetaDescription(
                    e.target.value
                  )
                }
                rows={4}
                placeholder={
                  excerpt ||
                  "Write a compelling description..."
                }
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Focus Keyword
              </label>

              <input
                value={focusKeyword}
                onChange={(e) =>
                  setFocusKeyword(
                    e.target.value
                  )
                }
                placeholder="ssc cgl admit card 2026"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Canonical URL
              </label>

              <input
                value={canonicalUrl}
                onChange={(e) =>
                  setCanonicalUrl(
                    e.target.value
                  )
                }
                placeholder="https://learnpathshala.in/blog/..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
              />
            </div>
          </div>
        </div>

        {/* GOOGLE PREVIEW */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-900">
            Google Preview
          </h3>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs text-green-700">
              learnpathshala.in › blog
            </div>

            <div className="mt-1 line-clamp-2 text-lg text-blue-700">
              {previewTitle}
            </div>

            <div className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">
              {previewDescription}
            </div>
          </div>
        </div>

        {/* OPEN GRAPH */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Open Graph
          </h3>

          <div className="space-y-4">
            <input
              value={ogTitle}
              onChange={(e) =>
                setOgTitle(e.target.value)
              }
              placeholder="Facebook/LinkedIn title"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />

            <textarea
              value={ogDescription}
              onChange={(e) =>
                setOgDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Facebook/LinkedIn description"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />

            <input
              value={ogImage}
              onChange={(e) =>
                setOgImage(e.target.value)
              }
              placeholder="Open Graph image URL"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />
          </div>
        </div>

        {/* TWITTER */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Twitter / X
          </h3>

          <div className="space-y-4">
            <input
              value={twitterTitle}
              onChange={(e) =>
                setTwitterTitle(
                  e.target.value
                )
              }
              placeholder="Twitter title"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />

            <textarea
              value={twitterDescription}
              onChange={(e) =>
                setTwitterDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Twitter description"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />

            <input
              value={twitterImage}
              onChange={(e) =>
                setTwitterImage(
                  e.target.value
                )
              }
              placeholder="Twitter image URL"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
            />
          </div>
        </div>

        {/* ROBOTS */}
        <div>
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Search Engine Robots
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Allow Indexing
                </div>

                <div className="text-xs text-slate-500">
                  Allow Google to index this page.
                </div>
              </div>

              <input
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) =>
                  setRobotsIndex(
                    e.target.checked
                  )
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Allow Following Links
                </div>

                <div className="text-xs text-slate-500">
                  Allow search engines to follow
                  links.
                </div>
              </div>

              <input
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) =>
                  setRobotsFollow(
                    e.target.checked
                  )
                }
                className="h-5 w-5"
              />
            </label>
          </div>
        </div>

        {/* SCHEMA */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Structured Data Schema
          </label>

          <select
            value={schemaType}
            onChange={(e) =>
              setSchemaType(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#063B8F]"
          >
            <option value="Article">
              Article
            </option>

            <option value="NewsArticle">
              NewsArticle
            </option>

            <option value="BlogPosting">
              BlogPosting
            </option>
          </select>
        </div>

        {/* SOCIAL IMAGE */}
        {previewImage && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Social Preview Image
            </h3>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img
                src={previewImage}
                alt=""
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
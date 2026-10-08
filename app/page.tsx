"use client";
import MarketList from "./marketList/marketList";
import GroupList from "./marketList/GroupList";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chip } from "@nextui-org/react";
import SideBar from "./components/SideBar";
import Dataprovider from "./dataProvider/dataProvider";
import { Category, MARKETS } from "./types";

const dp = new Dataprovider();

// The category with this slug, searched through the whole tree
function findCategory(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) return category;
    const child = findCategory(category.children, slug);
    if (child) return child;
  }
}

// The home page URL for a search and a category, either of them optional
function homeUrl(q?: string, category?: string | null) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function Home() {
  // The search and the category live in the URL (/?q=portakal&category=meyve-sebze/meyve),
  // so the search bar in the top bar can set them and the back button works
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || undefined;
  const categorySlug = searchParams.get("category") || undefined;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    dp.getCategories().then(setCategories);
  }, []);

  const category = categorySlug ? findCategory(categories, categorySlug) : undefined;

  // Picking a category during a search narrows the search instead of replacing it
  const selectCategory = (slug: string | null) => router.push(homeUrl(q, slug));

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "0 0 25%", padding: "20px" }}>
          <SideBar
            categories={categories}
            selected={categorySlug ?? null}
            onCategorySelect={selectCategory}
          />
        </div>
        <div style={{ flex: "1", padding: "20px", minWidth: 0 }}>
          {q || categorySlug ? (
            <>
              {/* What the comparison is filtered by; × removes one filter */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {q && (
                  <Chip size="lg" variant="flat" onClose={() => router.push(homeUrl(undefined, categorySlug))}>
                    &ldquo;{q}&rdquo;
                  </Chip>
                )}
                {categorySlug && (
                  <Chip size="lg" variant="flat" onClose={() => router.push(homeUrl(q, null))}>
                    {category?.name ?? categorySlug}
                  </Chip>
                )}
              </div>
              {/* Keyed on the filters, so a new search starts from page 1 */}
              <GroupList key={`${q ?? ""}|${categorySlug ?? ""}`} q={q} category={categorySlug} />
            </>
          ) : (
            // Every MarketList fetches its own first page as soon as it mounts, so all
            // five requests run at the same time and each market appears as soon as its
            // own response arrives. The API defaults to the day each market was last scraped.
            <div>
              {MARKETS.map((market) => (
                <MarketList key={market} market={market} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Home reads the URL's ?q= and ?category=, which Next.js only knows in the browser
export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

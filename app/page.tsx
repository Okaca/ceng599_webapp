"use client";
import MarketList from "./marketList/marketList";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideBar from "./components/SideBar";
import Dataprovider from "./dataProvider/dataProvider";
import { Category, MARKETS, MarketName } from "./types";

const dp = new Dataprovider();

// The category with this slug, searched through the whole tree
function findCategory(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) return category;
    const child = findCategory(category.children, slug);
    if (child) return child;
  }
}

function Home() {
  // The search and the category live in the URL (/?q=starking, /?category=meyve-sebze),
  // so the search bar in the top bar can set them and the back button works
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() || undefined;
  const categorySlug = searchParams.get("category");

  const [categories, setCategories] = useState<Category[]>([]);
  // How many products each market has for a filter, keyed by `${filter}|${market}`,
  // to tell when no market has any
  const [totals, setTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    dp.getCategories().then(setCategories);
  }, []);

  const filter = `${q ?? ""}|${categorySlug ?? ""}`;
  const category = categorySlug ? findCategory(categories, categorySlug) : undefined;
  const nothingFound =
    (q || categorySlug) && MARKETS.every((market) => totals[`${filter}|${market}`] === 0);

  const reportTotal = (market: MarketName) => (total: number) =>
    setTotals((current) => ({ ...current, [`${filter}|${market}`]: total }));

  const selectCategory = (slug: string | null) =>
    router.push(slug ? `/?category=${encodeURIComponent(slug)}` : "/");

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "0 0 25%", padding: "20px" }}>
          <SideBar
            categories={categories}
            selected={categorySlug}
            onCategorySelect={selectCategory}
          />
        </div>
        <div style={{ flex: "1", padding: "20px" }}>
          {q && <h1 className="text-center text-2xl font-bold">&ldquo;{q}&rdquo; için sonuçlar</h1>}
          {category && <h1 className="text-center text-2xl font-bold">{category.name}</h1>}
          {nothingFound && <p className="mt-8 text-center">Hiçbir markette eşleşen ürün yok.</p>}
          {/* Every MarketList fetches its own first page as soon as it mounts, so
              all five requests run at the same time and each market appears as
              soon as its own response arrives. The API defaults to the day each
              market was last scraped. Keying on the filter starts each list from
              page 1 when the search or category changes. */}
          <div>
            {MARKETS.map((market) => (
              <MarketList
                key={`${market}|${filter}`}
                market={market}
                category={categorySlug ?? undefined}
                q={q}
                onTotal={reportTotal(market)}
              />
            ))}
          </div>
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

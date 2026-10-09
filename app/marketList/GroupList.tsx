import React, { useEffect, useState } from "react";
import { Select, SelectItem } from "@nextui-org/react";
import GroupCard from "../components/GroupCard";
import Pager from "../components/Pager";
import Dataprovider from "../dataProvider/dataProvider";
import { DEFAULT_PAGE_SIZE, GroupPage, Sort } from "../types";

const dp = new Dataprovider();

const SORT_LABELS: Record<Sort, string> = {
  unit_price: "Birim fiyat (kg / L / adet)",
  price: "Fiyat",
};

interface GroupListProps {
  q?: string; // words the product names must contain
  category?: string; // a category slug
}

// Search or category results as products: each product once, with every market's
// price inside its card, the cheapest products first
const GroupList: React.FC<GroupListProps> = ({ q, category }) => {
  const [sort, setSort] = useState<Sort>("unit_price");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [data, setData] = useState<GroupPage | null>(null);

  useEffect(() => {
    // An answer that arrives after the user moved on is dropped
    let current = true;
    dp.getGroups({ q, category, sort, page, pageSize }).then(
      (result: GroupPage) => {
        if (current) setData(result);
      },
    );
    return () => {
      current = false;
    };
  }, [q, category, sort, page, pageSize]);

  const changeSort = (next: Sort) => {
    setSort(next);
    setPage(1);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-default-500">
          {data ? `${data.total} ürün` : ""}
        </span>
        <Select
          label="Sırala"
          size="sm"
          className="w-full sm:w-64"
          selectedKeys={[sort]}
          disallowEmptySelection
          onChange={(event) => changeSort(event.target.value as Sort)}
        >
          {(Object.keys(SORT_LABELS) as Sort[]).map((key) => (
            <SelectItem key={key} value={key}>
              {SORT_LABELS[key]}
            </SelectItem>
          ))}
        </Select>
      </div>

      {data === null ? (
        <p className="text-center">Yükleniyor...</p>
      ) : data.total === 0 ? (
        <p className="mt-8 text-center">Hiçbir markette eşleşen ürün yok.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {data.items.map((group) => (
              <GroupCard key={group.key} group={group} />
            ))}
          </div>
          <div className="py-6">
            <Pager
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={changePageSize}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GroupList;

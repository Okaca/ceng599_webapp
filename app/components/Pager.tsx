"use client";

import { Pagination, Select, SelectItem } from "@nextui-org/react";
import { PAGE_SIZES } from "../types";

interface PagerProps {
  page: number;
  pageSize: number;
  total: number; // items in the whole list
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// Page buttons plus a page size picker, e.g. "31-60 / 18556   < 1 2 3 ... >   [30]"
const Pager: React.FC<PagerProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 px-8">
      <span className="text-small text-default-500">
        {first}-{last} / {total}
      </span>
      <Pagination
        total={pages}
        page={page}
        onChange={onPageChange}
        showControls
        isCompact
      />
      <Select
        aria-label="Sayfa başına ürün"
        className="w-24"
        size="sm"
        selectedKeys={[String(pageSize)]}
        disallowEmptySelection
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        {PAGE_SIZES.map((size) => (
          <SelectItem key={String(size)} value={String(size)}>
            {String(size)}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default Pager;

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

// Page buttons plus a page size picker, e.g. "31-60 / 18556   < 1 2 3 ... >   [30]".
// On phones the page buttons get a row of their own, above the range and the picker.
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
    <div className="flex flex-wrap items-center justify-center gap-3 px-2 sm:gap-4 sm:px-8">
      <span className="order-2 text-small text-default-500 sm:order-1">
        {first}-{last} / {total}
      </span>
      <div className="order-1 flex w-full justify-center sm:order-2 sm:w-auto">
        <Pagination
          total={pages}
          page={page}
          onChange={onPageChange}
          showControls
          isCompact
        />
      </div>
      <Select
        aria-label="Sayfa başına ürün"
        className="order-3 w-24"
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

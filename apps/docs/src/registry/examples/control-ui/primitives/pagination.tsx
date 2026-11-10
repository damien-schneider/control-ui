"use client";

import type { ComponentProps, MouseEvent } from "react";
import { useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/control-ui/ui/pagination";

const LAST_PAGE = 8;
const VISIBLE_PAGES = [1, 2, 3];

// Stands in for your router's link component, which PaginationLink renders through `render`.
function RouterLink({ href, children, ...props }: ComponentProps<"a">) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export function PrimitivePaginationExample() {
  const [page, setPage] = useState(2);
  const go = (target: number) => (event: MouseEvent) => {
    event.preventDefault();
    setPage(Math.min(LAST_PAGE, Math.max(1, target)));
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={`?page=${page - 1}`} disabled={page === 1} onClick={go(page - 1)} />
        </PaginationItem>
        {VISIBLE_PAGES.map((visiblePage) => (
          <PaginationItem key={visiblePage}>
            <PaginationLink render={<RouterLink />} href={`?page=${visiblePage}`} isActive={page === visiblePage} onClick={go(visiblePage)}>
              {visiblePage}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink render={<RouterLink />} href={`?page=${LAST_PAGE}`} isActive={page === LAST_PAGE} onClick={go(LAST_PAGE)}>
            {LAST_PAGE}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href={`?page=${page + 1}`} disabled={page === LAST_PAGE} onClick={go(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

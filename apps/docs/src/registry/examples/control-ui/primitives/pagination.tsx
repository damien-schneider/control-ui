"use client";

import type { MouseEvent } from "react";
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
          <PaginationPrevious href="#" onClick={go(page - 1)} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive={page === 1} onClick={go(1)}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive={page === 2} onClick={go(2)}>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive={page === 3} onClick={go(3)}>
            3
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive={page === LAST_PAGE} onClick={go(LAST_PAGE)}>
            {LAST_PAGE}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" onClick={go(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

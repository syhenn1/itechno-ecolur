"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Simple Prev/Next pager for a client-side-sliced list (see PrizeClaimsList). Kept generic so
 *  any other list that grows past a page's worth of rows can reuse it. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Sebelumnya
      </Button>
      <span className="text-xs font-medium text-slate-500">
        Halaman {page} dari {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Berikutnya
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PrizeClaimRow } from "@/components/admin/prize-claim-row";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 10;

interface PendingClaim {
  id: string;
  userName: string;
  userPhone: string;
  level: number;
  prize: string;
}

/** The pending-claims list is unbounded server-side (an active pilot village can realistically
 *  pile up more than a screenful) — paginated client-side here since the whole set is already
 *  fetched in one query and re-fetching per page would just add a round trip for no benefit at
 *  this data size. */
export function PrizeClaimsList({ claims }: { claims: PendingClaim[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(claims.length / PAGE_SIZE));
  const pageClaims = claims.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {pageClaims.map((claim) => (
          <PrizeClaimRow
            key={claim.id}
            claimId={claim.id}
            userName={claim.userName}
            userPhone={claim.userPhone}
            level={claim.level}
            prize={claim.prize}
          />
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

import { NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { fail } from "@/lib/customerAuth";

export const ADMIN_PAGE_SIZE = 20;

// Trả response 401 nếu chưa đăng nhập admin, ngược lại null
export function requireAdmin(request: NextRequest) {
  return verifyAdminSession(request) ? null : fail("Quyền truy cập bị từ chối.", 401);
}

export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const customerSummarySelect = { id: true, name: true, email: true, phone: true } as const;

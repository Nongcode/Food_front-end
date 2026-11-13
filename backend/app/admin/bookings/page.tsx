"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "../../components/admin/AdminContext";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["Chờ xử lý", "Đang xử lý", "Đã xác nhận", "Hoàn tất", "Đã hủy"];

function statusClass(status: string) {
  if (status === "Chờ xử lý") return "bg-amber-100 text-amber-700";
  if (status === "Đang xử lý") return "bg-blue-100 text-blue-700";
  if (status === "Đã xác nhận" || status === "Hoàn tất") return "bg-emerald-100 text-emerald-700";
  return "bg-rose-100 text-rose-700";
}

// Yêu cầu đặt combo kiểu cũ (Booking) — chỉ còn để tra cứu; đơn mới nằm ở /admin/orders
export default function ArchivedBookingsPage() {
  const { bookings, isAuthenticated } = useAdmin();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [viewingRequestId, setViewingRequestId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const query = searchQuery.toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.phone.includes(searchQuery) ||
      b.tourName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "Tất cả" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const viewing = bookings.find((b) => b.id === viewingRequestId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Yêu cầu cũ (lưu trữ)</h2>
        <p className="text-xs text-slate-500 mt-1">
          Yêu cầu đặt combo theo mẫu cũ, chỉ để tra cứu. Đơn mới xem ở{" "}
          <Link href="/admin/orders" className="font-bold text-emerald-700 hover:underline">Đơn hàng</Link>, yêu cầu tư vấn ở{" "}
          <Link href="/admin/inquiries" className="font-bold text-emerald-700 hover:underline">Yêu cầu tư vấn</Link>.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm tên khách, SĐT, combo..."
          className="w-full sm:max-w-xs flex-1 px-4 rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-700"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-700"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Combo đặc sản</th>
                <th className="px-6 py-4">Ngày đặt / Ngày nhận</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Giá tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ghi chú nội bộ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không có yêu cầu cũ nào.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="text-slate-800 font-bold block">{b.customerName}</strong>
                      <span className="text-xs text-slate-400 font-medium block">{b.phone}</span>
                      <span className="text-xs text-slate-400 font-mono block">{b.email}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {b.tourName}
                      {b.notes && (
                        <button
                          onClick={() => setViewingRequestId(b.id)}
                          className="mt-1 block text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full w-fit border border-amber-100"
                        >
                          Xem yêu cầu: {b.notes.length > 20 ? `${b.notes.substring(0, 20)}...` : b.notes}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="block text-xs">Đặt: {b.bookingDate}</span>
                      <span className="block text-xs font-bold text-slate-700">Nhận: {b.travelDate}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{b.numberOfTravelers}</td>
                    <td className="px-6 py-4 text-emerald-800 font-black">{b.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${statusClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-wrap">{b.adminNotes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {viewing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Yêu cầu từ khách hàng</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 text-sm font-medium text-slate-700 whitespace-pre-wrap">
                {viewing.notes || "Không có yêu cầu đặc biệt."}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setViewingRequestId(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

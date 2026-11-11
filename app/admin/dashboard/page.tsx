"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdmin, type AdminBooking, type AdminPackage, type AdminCustomer } from "../../components/admin/AdminContext";

type VendorProfile = {
  id: string;
  name: string;
  owner: string;
  area: string;
  keywords: string[];
  accent: string;
};

const TEXT = {
  systemTitle: "\u0110i\u1ec1u h\u00e0nh s\u00e0n Son La Food",
  vendorTitle: "Dashboard gian h\u00e0ng",
  subtitleSystem: "Theo d\u00f5i doanh thu, \u0111\u01a1n h\u00e0ng, s\u1ea3n ph\u1ea9m v\u00e0 t\u00ecnh tr\u1ea1ng v\u1eadn h\u00e0nh to\u00e0n b\u1ed9 marketplace.",
  subtitleVendor: "Theo d\u00f5i doanh thu, y\u00eau c\u1ea7u \u0111\u1eb7t h\u00e0ng v\u00e0 s\u1ea3n ph\u1ea9m thu\u1ed9c gian h\u00e0ng c\u1ee7a b\u1ea1n.",
  totalRevenue: "Doanh thu \u01b0\u1edbc t\u00ednh",
  orders: "Y\u00eau c\u1ea7u \u0111\u1eb7t h\u00e0ng",
  products: "S\u1ea3n ph\u1ea9m \u0111ang b\u00e1n",
  stores: "Gian h\u00e0ng",
  pending: "Ch\u1edd x\u1eed l\u00fd",
  completed: "Ho\u00e0n t\u1ea5t",
  processing: "\u0110ang x\u1eed l\u00fd",
  confirmed: "\u0110\u00e3 x\u00e1c nh\u1eadn",
  cancelled: "\u0110\u00e3 h\u1ee7y",
  overview: "T\u1ed5ng quan v\u1eadn h\u00e0nh",
  statusTitle: "Tr\u1ea1ng th\u00e1i \u0111\u01a1n h\u00e0ng",
  revenueTitle: "Doanh thu theo nh\u00f3m gian h\u00e0ng",
  recentOrders: "Y\u00eau c\u1ea7u m\u1edbi nh\u1ea5t",
  productTable: "S\u1ea3n ph\u1ea9m n\u1ed5i b\u1eadt",
  customerTitle: "Kh\u00e1ch h\u00e0ng ti\u1ec1m n\u0103ng",
  allStores: "To\u00e0n h\u1ec7 th\u1ed1ng",
  storeScope: "Ph\u1ea1m vi gian h\u00e0ng",
  manageProducts: "Qu\u1ea3n l\u00fd s\u1ea3n ph\u1ea9m",
  manageOrders: "Xem \u0111\u01a1n h\u00e0ng",
  note: "D\u1eef li\u1ec7u hi\u1ec7n l\u00e0 demo \u0111\u1ec3 tr\u00ecnh b\u00e0y giao di\u1ec7n marketplace; ph\u00e2n quy\u1ec1n API theo vendor s\u1ebd \u0111\u01b0\u1ee3c t\u00e1ch \u1edf giai \u0111o\u1ea1n logic th\u1eadt.",
};

const VENDORS: VendorProfile[] = [
  { id: "vendor-giavi", name: "Gian h\u00e0ng Gia v\u1ecb T\u00e2y B\u1eafc", owner: "H\u1ed9 kinh doanh M\u01b0\u1eddng La", area: "S\u01a1n La", keywords: ["gia vi", "cham cheo", "mac khen", "thit gac", "thit trau", "do kho"], accent: "from-emerald-600 to-teal-700" },
  { id: "vendor-mocchau", name: "Gian h\u00e0ng Qu\u00e0 M\u1ed9c Ch\u00e2u", owner: "HTX Qu\u00e0 t\u1eb7ng M\u1ed9c Ch\u00e2u", area: "M\u1ed9c Ch\u00e2u", keywords: ["moc chau", "qua", "doanh nghiep", "tra", "mat ong", "set qua"], accent: "from-amber-500 to-orange-600" },
  { id: "vendor-yenchau", name: "Gian h\u00e0ng Tr\u00e1i c\u00e2y Y\u00ean Ch\u00e2u", owner: "V\u01b0\u1eddn n\u00f4ng s\u1ea3n Y\u00ean Ch\u00e2u", area: "Y\u00ean Ch\u00e2u", keywords: ["yen chau", "trai cay", "xoai", "man", "theo mua"], accent: "from-rose-500 to-red-600" },
];

const STATUS_ORDER = [TEXT.pending, TEXT.processing, TEXT.confirmed, TEXT.completed, TEXT.cancelled];

function clean(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  for (let index = 0; index < 3 && /[\u00c2\u00c3\u00c4]/.test(text); index += 1) {
    try {
      text = new TextDecoder("utf-8").decode(Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 255)));
    } catch {
      break;
    }
  }
  return text.replace(/\uFFFD/g, "").trim();
}

function normalize(value?: string | number | null) {
  return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/\u0110/g, "D").toLowerCase();
}

function parseMoney(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(clean(value).replace(/[^0-9]/g, "")) || 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value || 0);
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0) + "\u0111";
}

function getStatus(value?: string | null) {
  const text = normalize(value);
  if (text.includes("hoan tat") || text.includes("completed")) return TEXT.completed;
  if (text.includes("xac nhan") || text.includes("confirmed")) return TEXT.confirmed;
  if (text.includes("dang xu ly") || text.includes("processing")) return TEXT.processing;
  if (text.includes("huy") || text.includes("cancel")) return TEXT.cancelled;
  return TEXT.pending;
}

function matchVendor(text: string, vendor: VendorProfile) {
  const source = normalize(text);
  return vendor.keywords.some((keyword) => source.includes(keyword));
}

function getVendorForAdmin(email?: string | null) {
  const normalizedEmail = normalize(email);
  return VENDORS.find((vendor) => normalizedEmail.includes(vendor.id.replace("vendor-", "")) || normalizedEmail === vendor.id) || null;
}

function productVendor(product: AdminPackage) {
  const source = clean(product.name) + " " + clean(product.destination);
  return VENDORS.find((vendor) => matchVendor(source, vendor)) || VENDORS[0];
}

function StatCard({ label, value, helper, tone }: { label: string; value: string | number; helper: string; tone: string }) {
  return (
    <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${tone} opacity-15 blur-2xl`} />
      <p className="relative text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <strong className="relative mt-3 block text-3xl font-black tracking-tight text-slate-950">{value}</strong>
      <span className="relative mt-3 inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">{helper}</span>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === TEXT.completed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === TEXT.cancelled ? "border-red-200 bg-red-50 text-red-700" : status === TEXT.confirmed ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${tone}`}>{status}</span>;
}

export default function AdminDashboardPage() {
  const { currentAdmin, packages, bookings, customers } = useAdmin();
  const [selectedVendorId, setSelectedVendorId] = useState("all");
  const isSystemAdmin = currentAdmin?.role === "admin" || currentAdmin?.email === "admin";
  const loginVendor = getVendorForAdmin(currentAdmin?.email);
  const activeVendor = isSystemAdmin ? (selectedVendorId === "all" ? null : VENDORS.find((vendor) => vendor.id === selectedVendorId) || null) : loginVendor || VENDORS[0];

  const scopedProducts = useMemo(() => {
    if (!activeVendor) return packages;
    return packages.filter((item) => matchVendor(clean(item.name) + " " + clean(item.destination), activeVendor));
  }, [activeVendor, packages]);

  const scopedBookings = useMemo(() => {
    if (!activeVendor) return bookings;
    return bookings.filter((item) => matchVendor(clean(item.tourName) + " " + clean(item.notes) + " " + clean(item.adminNotes), activeVendor));
  }, [activeVendor, bookings]);

  const scopedCustomers = useMemo(() => {
    if (!activeVendor) return customers;
    const bookingPhones = new Set(scopedBookings.map((booking) => clean(booking.phone)));
    return customers.filter((customer) => bookingPhones.has(clean(customer.phone)) || matchVendor(clean(customer.notes) + " " + clean(customer.totalSpent), activeVendor));
  }, [activeVendor, customers, scopedBookings]);

  const stats = useMemo(() => {
    const revenue = scopedBookings.reduce((sum, booking) => {
      const status = getStatus(booking.status);
      return status === TEXT.completed || status === TEXT.confirmed ? sum + parseMoney(booking.totalPrice) : sum;
    }, 0);
    const pending = scopedBookings.filter((booking) => getStatus(booking.status) === TEXT.pending).length;
    const completed = scopedBookings.filter((booking) => getStatus(booking.status) === TEXT.completed).length;
    return { revenue, pending, completed, orders: scopedBookings.length, products: scopedProducts.length };
  }, [scopedBookings, scopedProducts.length]);

  const revenueByVendor = useMemo(() => {
    return VENDORS.map((vendor) => {
      const vendorBookings = bookings.filter((booking) => matchVendor(clean(booking.tourName) + " " + clean(booking.notes), vendor));
      const revenue = vendorBookings.reduce((sum, booking) => {
        const status = getStatus(booking.status);
        return status === TEXT.completed || status === TEXT.confirmed ? sum + parseMoney(booking.totalPrice) : sum;
      }, 0);
      return { vendor, revenue, orders: vendorBookings.length };
    });
  }, [bookings]);

  const statusCounts = STATUS_ORDER.map((status) => ({ status, count: scopedBookings.filter((booking) => getStatus(booking.status) === status).length }));
  const maxStatus = Math.max(...statusCounts.map((item) => item.count), 1);
  const maxVendorRevenue = Math.max(...revenueByVendor.map((item) => item.revenue), 1);
  const scopeTitle = activeVendor ? activeVendor.name : TEXT.allStores;

  return (
    <div className="space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-900/10 bg-[#0b463a] p-6 text-white shadow-sm md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,209,111,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_32%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-100">{isSystemAdmin ? "System Admin" : "Vendor Portal"}</span>
            <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">{isSystemAdmin ? TEXT.systemTitle : TEXT.vendorTitle}</h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-emerald-50/80">{isSystemAdmin ? TEXT.subtitleSystem : TEXT.subtitleVendor}</p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">{TEXT.storeScope}</p>
            <strong className="mt-2 block text-xl font-black">{scopeTitle}</strong>
            <span className="mt-1 block text-sm text-emerald-50/70">{currentAdmin?.fullName || "Admin demo"}</span>
          </div>
        </div>
      </section>

      {isSystemAdmin ? (
        <section className="flex flex-wrap items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
          <button type="button" onClick={() => setSelectedVendorId("all")} className={`rounded-full px-4 py-2 text-sm font-black ${selectedVendorId === "all" ? "bg-emerald-700 text-white" : "bg-slate-50 text-slate-700"}`}>{TEXT.allStores}</button>
          {VENDORS.map((vendor) => <button key={vendor.id} type="button" onClick={() => setSelectedVendorId(vendor.id)} className={`rounded-full px-4 py-2 text-sm font-black ${selectedVendorId === vendor.id ? "bg-emerald-700 text-white" : "bg-slate-50 text-slate-700"}`}>{vendor.name}</button>)}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={TEXT.totalRevenue} value={formatCurrency(stats.revenue)} helper={`${stats.completed} ${TEXT.completed.toLowerCase()}`} tone="from-emerald-500 to-teal-600" />
        <StatCard label={TEXT.orders} value={stats.orders} helper={`${stats.pending} ${TEXT.pending.toLowerCase()}`} tone="from-amber-400 to-orange-500" />
        <StatCard label={TEXT.products} value={stats.products} helper={activeVendor ? activeVendor.area : `${VENDORS.length} gian h\u00e0ng demo`} tone="from-blue-500 to-cyan-500" />
        <StatCard label={TEXT.stores} value={activeVendor ? 1 : VENDORS.length} helper={activeVendor ? activeVendor.owner : "Marketplace"} tone="from-rose-500 to-red-500" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#df4f3c]">{TEXT.revenueTitle}</p><h2 className="mt-2 text-2xl font-black text-slate-950">{TEXT.overview}</h2></div>
            <Link href="/admin/bookings" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white">{TEXT.manageOrders}</Link>
          </div>
          <div className="mt-8 space-y-5">
            {revenueByVendor.map(({ vendor, revenue, orders }) => (
              <div key={vendor.id} className="grid gap-3 md:grid-cols-[220px_1fr_120px] md:items-center">
                <div><strong className="block text-sm font-black text-slate-900">{vendor.name}</strong><span className="text-xs font-bold text-slate-500">{orders} {TEXT.orders.toLowerCase()}</span></div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full bg-gradient-to-r ${vendor.accent}`} style={{ width: `${Math.max(8, (revenue / maxVendorRevenue) * 100)}%` }} /></div>
                <span className="text-right text-sm font-black text-slate-900">{compactCurrency(revenue)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#df4f3c]">{TEXT.statusTitle}</p>
          <div className="mt-6 space-y-4">
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between text-sm font-black text-slate-700"><span>{item.status}</span><span>{item.count}</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(4, (item.count / maxStatus) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#df4f3c]">{TEXT.recentOrders}</p><h2 className="mt-2 text-2xl font-black text-slate-950">{scopeTitle}</h2></div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="px-6 py-4">{"Kh\u00e1ch h\u00e0ng"}</th><th className="px-6 py-4">{"S\u1ea3n ph\u1ea9m / combo"}</th><th className="px-6 py-4">{"Gi\u00e1 tr\u1ecb"}</th><th className="px-6 py-4">{"Tr\u1ea1ng th\u00e1i"}</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {scopedBookings.slice(0, 6).map((booking: AdminBooking) => <tr key={booking.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><strong>{clean(booking.customerName)}</strong><span className="mt-1 block text-xs font-bold text-slate-400">{clean(booking.phone)}</span></td><td className="px-6 py-4 font-bold text-slate-700">{clean(booking.tourName)}</td><td className="px-6 py-4 font-black text-slate-950">{clean(booking.totalPrice) || "-"}</td><td className="px-6 py-4"><StatusPill status={getStatus(booking.status)} /></td></tr>)}
                {scopedBookings.length === 0 ? <tr><td colSpan={4} className="px-6 py-10 text-center font-bold text-slate-400">{"Ch\u01b0a c\u00f3 y\u00eau c\u1ea7u ph\u00f9 h\u1ee3p."}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#df4f3c]">{TEXT.productTable}</p><h2 className="mt-2 text-2xl font-black text-slate-950">{"S\u1ea3n ph\u1ea9m \u0111ang b\u00e1n"}</h2></div><Link href="/admin/packages" className="rounded-full border border-emerald-700/20 px-4 py-2 text-sm font-black text-emerald-800">{TEXT.manageProducts}</Link></div>
          <div className="mt-6 space-y-3">
            {scopedProducts.slice(0, 6).map((item: AdminPackage) => { const vendor = productVendor(item); return <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-start justify-between gap-3"><div><strong className="block text-base font-black text-slate-950">{clean(item.name)}</strong><span className="mt-1 block text-xs font-bold text-slate-500">{activeVendor ? clean(item.destination) : vendor.name}</span></div><span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800">{clean(item.price)}</span></div></div>; })}
            {scopedProducts.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-center font-bold text-slate-400">{"Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p."}</p> : null}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#df4f3c]">{TEXT.customerTitle}</p>
          <div className="mt-5 grid gap-3">
            {scopedCustomers.slice(0, 4).map((customer: AdminCustomer) => <div key={customer.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><div><strong className="block font-black text-slate-950">{clean(customer.name)}</strong><span className="text-xs font-bold text-slate-500">{clean(customer.phone)}</span></div><span className="text-sm font-black text-emerald-800">{clean(customer.totalSpent)}</span></div>)}
          </div>
        </article>
        <article className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Demo scope</p><h2 className="mt-2 text-2xl font-black text-slate-950">{"Lu\u1ed3ng ph\u00e2n quy\u1ec1n \u0111\u1ec1 xu\u1ea5t"}</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold leading-6 text-slate-700 md:grid-cols-2"><p className="rounded-2xl bg-white/70 p-4">{"Admin h\u1ec7 th\u1ed1ng xem to\u00e0n b\u1ed9 doanh thu, \u0111\u01a1n h\u00e0ng, kh\u00e1ch h\u00e0ng v\u00e0 s\u1ea3n ph\u1ea9m c\u1ee7a marketplace."}</p><p className="rounded-2xl bg-white/70 p-4">{"Vendor ch\u1ec9 xem doanh thu, \u0111\u01a1n h\u00e0ng v\u00e0 s\u1ea3n ph\u1ea9m thu\u1ed9c gian h\u00e0ng c\u1ee7a m\u00ecnh."}</p></div>
          <p className="mt-4 text-sm font-semibold leading-6 text-amber-900/80">{TEXT.note}</p>
        </article>
      </section>
    </div>
  );
}
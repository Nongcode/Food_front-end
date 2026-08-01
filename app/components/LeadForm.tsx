"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "./I18nProvider";

type LeadFormProps = {
  packages: string[];
  defaultPackage?: string;
};

const requestTypeOptions = [
  "Đặt mua số lượng lớn",
  "Custom set quà tặng riêng",
  "Tư vấn combo theo ngân sách",
  "Đặt hàng cho doanh nghiệp / sự kiện",
  "Hỏi thông tin sản phẩm đặc sản",
];

function buildInquiryNotes(formData: FormData) {
  const fields = [
    ["Nhu cầu", formData.get("requestType")],
    ["Sản phẩm / đặc sản quan tâm", formData.get("products")],
    ["Số lượng dự kiến", formData.get("quantity")],
    ["Ngân sách dự kiến", formData.get("budget")],
    ["Dịp mua / đối tượng tặng", formData.get("occasion")],
    ["Khu vực nhận hàng", formData.get("deliveryArea")],
    ["Yêu cầu chi tiết", formData.get("notes")],
  ];

  return fields
    .map(([label, value]) => `${label}: ${String(value || "Chưa cung cấp").trim() || "Chưa cung cấp"}`)
    .join("\n");
}

export function LeadForm({ packages, defaultPackage }: LeadFormProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(true);
    setError("");
    setSent(false);

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const requestType = String(formData.get("requestType") || "").trim();
    const products = String(formData.get("products") || "").trim();
    const tourName = products ? `${requestType} - ${products}` : requestType;
    const notes = buildInquiryNotes(formData);

    if (!requestType) {
      setError("Vui lòng chọn nhu cầu liên hệ.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          tourName,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        form.reset();
        setSent(true);
      } else {
        setError(data.error || "Có lỗi xảy ra khi gửi yêu cầu.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lead-form custom-order-form" onSubmit={handleSubmit}>
      <div className="lead-form-intro">
        <span>Yêu cầu linh hoạt</span>
        <p>Phù hợp khi bạn muốn đặt số lượng lớn, phối set quà riêng hoặc cần báo giá theo ngân sách.</p>
      </div>

      <label>
        {t("form", "name", "Họ và tên")} *
        <input suppressHydrationWarning name="name" type="text" placeholder="Nguyễn Minh Anh" required />
      </label>

      <div className="form-row">
        <label>
          {t("form", "phone", "Số điện thoại")} *
          <input suppressHydrationWarning name="phone" type="tel" placeholder="09xx xxx xxx" required />
        </label>
        <label>
          {t("form", "email", "Địa chỉ Email")} *
          <input suppressHydrationWarning name="email" type="email" placeholder="email@example.com" required />
        </label>
      </div>

      <label>
        Nhu cầu liên hệ *
        <select name="requestType" defaultValue="" required>
          <option value="" disabled>Chọn nhu cầu của bạn</option>
          {requestTypeOptions.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      </label>

      <label>
        Sản phẩm hoặc set quà muốn đặt
        <input
          suppressHydrationWarning
          name="products"
          type="text"
          list="lead-product-suggestions"
          defaultValue={defaultPackage || ""}
          placeholder="Ví dụ: thịt gác bếp, chẩm chéo, set quà doanh nghiệp..."
        />
        <datalist id="lead-product-suggestions">
          {packages.map((pkg) => <option value={pkg} key={pkg} />)}
        </datalist>
      </label>

      <div className="form-row three-fields">
        <label>
          Số lượng dự kiến
          <input suppressHydrationWarning name="quantity" type="text" placeholder="Ví dụ: 20 hộp, 50 phần..." />
        </label>
        <label>
          Ngân sách dự kiến
          <input suppressHydrationWarning name="budget" type="text" placeholder="Ví dụ: 300k/phần" />
        </label>
        <label>
          Khu vực nhận hàng
          <input suppressHydrationWarning name="deliveryArea" type="text" placeholder="Tỉnh/thành, quận/huyện" />
        </label>
      </div>

      <label>
        Dịp mua / đối tượng tặng
        <input suppressHydrationWarning name="occasion" type="text" placeholder="Ví dụ: quà Tết, quà đối tác, tiệc công ty..." />
      </label>

      <label>
        Yêu cầu chi tiết
        <textarea
          suppressHydrationWarning
          name="notes"
          rows={5}
          placeholder="Bạn có thể mô tả khẩu vị, món không muốn dùng, kiểu đóng gói, thời gian cần nhận hàng hoặc yêu cầu in thiệp/logo..."
        />
      </label>

      <button suppressHydrationWarning type="submit" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi yêu cầu đặt hàng"}
      </button>

      {sent && (
        <p className="form-status success" role="status" style={{ marginTop: "16px" }}>
          Đã ghi nhận thông tin. Nhân viên Sơn La Food sẽ liên hệ lại để tư vấn set phù hợp và xác nhận yêu cầu đặt hàng.
        </p>
      )}

      {error && (
        <p className="form-status error" role="alert" style={{ marginTop: "16px" }}>
          {error}
        </p>
      )}
    </form>
  );
}

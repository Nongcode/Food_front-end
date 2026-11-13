"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useI18n } from "./I18nProvider";
import { markCustomerSignedOut, useCurrentCustomer } from "@/lib/customerSession";
import { ApiError, submitInquiry } from "@/lib/customerOrders";

type LeadFormProps = {
  packages: string[];
  defaultPackage?: string;
};

// Giá trị gửi lên BE giữ tiếng Việt (admin đọc); nhãn hiển thị dịch theo ngôn ngữ
const requestTypeOptions = [
  { value: "Đặt mua số lượng lớn", key: "request_bulk" },
  { value: "Custom set quà tặng riêng", key: "request_custom" },
  { value: "Tư vấn combo theo ngân sách", key: "request_budget" },
  { value: "Đặt hàng cho doanh nghiệp / sự kiện", key: "request_business" },
  { value: "Hỏi thông tin sản phẩm đặc sản", key: "request_info" },
];

// Khớp giới hạn BE (/api/inquiries: mỗi trường tối đa 2000 ký tự, tên 120)
const MAX_TEXT = 2000;
const MAX_NAME = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXT_FIELDS = ["products", "quantity", "budget", "deliveryArea", "occasion", "notes"] as const;

type FieldName = "name" | "phone" | "email" | "requestType" | (typeof TEXT_FIELDS)[number];

export function LeadForm({ packages, defaultPackage }: LeadFormProps) {
  const router = useRouter();
  const { t, href } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const { customer: currentUser, loading: userLoading } = useCurrentCustomer();
  const isMounted = !userLoading;
  const uniquePackages = Array.from(new Set(packages));

  // Nhánh "chưa đăng nhập" chỉ hiện sau khi đã hỏi BE (phía client) nên đọc window an toàn
  function loginHref() {
    const next = typeof window !== "undefined" ? window.location.pathname : href("/");
    return `${href("/dang-nhap")}?next=${encodeURIComponent(next)}`;
  }

  function validate(field: (name: string) => string) {
    const errors: Partial<Record<FieldName, string>> = {};
    if (!field("name")) errors.name = t("leadForm", "error_name", "Vui lòng nhập họ và tên.");
    else if (field("name").length > MAX_NAME) errors.name = t("leadForm", "error_name_long", "Họ và tên tối đa 120 ký tự.");
    if (!field("phone")) errors.phone = t("leadForm", "error_phone", "Vui lòng nhập số điện thoại.");
    else if (!/^\d{9,11}$/.test(field("phone").replace(/[\s.-]/g, ""))) errors.phone = t("leadForm", "error_phone_invalid", "Số điện thoại không hợp lệ.");
    if (!field("email")) errors.email = t("leadForm", "error_email", "Vui lòng nhập email.");
    else if (!EMAIL_PATTERN.test(field("email"))) errors.email = t("leadForm", "error_email_invalid", "Email không hợp lệ.");
    if (!field("requestType")) errors.requestType = t("leadForm", "error_request_type", "Vui lòng chọn nhu cầu liên hệ.");
    for (const name of TEXT_FIELDS) {
      if (field(name).length > MAX_TEXT) errors[name] = t("leadForm", "error_too_long", "Tối đa 2000 ký tự.");
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;

    if (!currentUser) {
      router.push(loginHref());
      return;
    }

    const formData = new FormData(form);
    const field = (name: string) => String(formData.get(name) || "").trim();
    const errors = validate(field);
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      setSent(false);
      setError(t("leadForm", "error_fields", "Vui lòng kiểm tra các trường được đánh dấu."));
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setLoading(true);
    setError("");
    setSent(false);

    try {
      await submitInquiry({
        requestType: field("requestType"),
        products: field("products"),
        quantity: field("quantity"),
        budget: field("budget"),
        occasion: field("occasion"),
        deliveryArea: field("deliveryArea"),
        notes: field("notes"),
        contactName: field("name"),
        contactPhone: field("phone"),
        contactEmail: field("email"),
      });
      form.reset();
      setSent(true);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        markCustomerSignedOut();
        router.push(loginHref());
        return;
      }
      setError(caughtError instanceof Error ? caughtError.message : t("leadForm", "error_generic", "Có lỗi xảy ra khi gửi yêu cầu."));
    } finally {
      setLoading(false);
    }
  }

  function fieldProps(name: FieldName) {
    const message = fieldErrors[name];
    return {
      name,
      "aria-invalid": message ? true : undefined,
      "aria-describedby": message ? `lead-error-${name}` : undefined,
      onInput: () => {
        if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }));
      },
    };
  }

  function fieldError(name: FieldName) {
    const message = fieldErrors[name];
    return message ? <small className="form-field-error" id={`lead-error-${name}`}>{message}</small> : null;
  }

  if (isMounted && !currentUser) {
    return (
      <div className="lead-form custom-order-form auth-required-card">
        <div className="lead-form-intro">
          <span>{t("leadForm", "login_required", "Yêu cầu đăng nhập")}</span>
          <p>{t("leadForm", "login_required_copy", "Bạn cần đăng nhập hoặc tạo tài khoản để gửi yêu cầu tư vấn. Thông tin đăng ký sẽ được tự động điền vào form sau khi đăng nhập.")}</p>
        </div>
        <div className="auth-required-actions">
          <Link href={loginHref()}>{t("cart", "login", "Đăng nhập")}</Link>
          <Link href={href("/dang-ky")}>{t("leadForm", "register", "Đăng ký tài khoản")}</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="lead-form custom-order-form" key={currentUser?.id || "guest"} onSubmit={handleSubmit} noValidate>
      <div className="lead-form-intro">
        <span>{t("leadForm", "intro_title", "Yêu cầu linh hoạt")}</span>
        <p>{t("leadForm", "intro_copy", "Phù hợp khi bạn muốn đặt số lượng lớn, phối set quà riêng hoặc cần báo giá theo ngân sách.")}</p>
      </div>

      <label>
        {t("form", "name", "Họ và tên")} *
        <input suppressHydrationWarning {...fieldProps("name")} type="text" defaultValue={currentUser?.name || ""} placeholder={t("form", "name_placeholder", "Nguyễn Minh Anh")} maxLength={MAX_NAME} />
        {fieldError("name")}
      </label>

      <div className="form-row">
        <label>
          {t("form", "phone", "Số điện thoại")} *
          <input suppressHydrationWarning {...fieldProps("phone")} type="tel" defaultValue={currentUser?.phone || ""} placeholder="09xx xxx xxx" maxLength={20} />
          {fieldError("phone")}
        </label>
        <label>
          {t("form", "email", "Địa chỉ Email")} *
          <input suppressHydrationWarning {...fieldProps("email")} type="email" defaultValue={currentUser?.email || ""} placeholder="email@example.com" maxLength={200} />
          {fieldError("email")}
        </label>
      </div>

      <label>
        {t("leadForm", "request_type", "Nhu cầu liên hệ")} *
        <select {...fieldProps("requestType")} defaultValue="" onChange={() => fieldErrors.requestType && setFieldErrors((current) => ({ ...current, requestType: undefined }))}>
          <option value="" disabled>{t("leadForm", "request_type_placeholder", "Chọn nhu cầu của bạn")}</option>
          {requestTypeOptions.map((option) => <option value={option.value} key={option.value}>{t("leadForm", option.key, option.value)}</option>)}
        </select>
        {fieldError("requestType")}
      </label>

      <label>
        {t("leadForm", "products", "Sản phẩm hoặc set quà muốn đặt")}
        <input
          suppressHydrationWarning
          {...fieldProps("products")}
          type="text"
          list="lead-product-suggestions"
          defaultValue={defaultPackage || ""}
          maxLength={MAX_TEXT}
          placeholder={t("leadForm", "products_placeholder", "Ví dụ: thịt gác bếp, chẩm chéo, set quà doanh nghiệp...")}
        />
        <datalist id="lead-product-suggestions">
          {uniquePackages.map((pkg) => <option value={pkg} key={pkg} />)}
        </datalist>
        {fieldError("products")}
      </label>

      <div className="form-row three-fields">
        <label>
          {t("leadForm", "quantity", "Số lượng dự kiến")}
          <input suppressHydrationWarning {...fieldProps("quantity")} type="text" maxLength={MAX_TEXT} placeholder={t("leadForm", "quantity_placeholder", "Ví dụ: 20 hộp, 50 phần...")} />
          {fieldError("quantity")}
        </label>
        <label>
          {t("leadForm", "budget", "Ngân sách dự kiến")}
          <input suppressHydrationWarning {...fieldProps("budget")} type="text" maxLength={MAX_TEXT} placeholder={t("leadForm", "budget_placeholder", "Ví dụ: 300k/phần")} />
          {fieldError("budget")}
        </label>
        <label>
          {t("leadForm", "delivery_area", "Khu vực nhận hàng")}
          <input suppressHydrationWarning {...fieldProps("deliveryArea")} type="text" maxLength={MAX_TEXT} defaultValue={currentUser?.address || ""} placeholder={t("leadForm", "delivery_area_placeholder", "Tỉnh/thành, quận/huyện")} />
          {fieldError("deliveryArea")}
        </label>
      </div>

      <label>
        {t("leadForm", "occasion", "Dịp mua / đối tượng tặng")}
        <input suppressHydrationWarning {...fieldProps("occasion")} type="text" maxLength={MAX_TEXT} placeholder={t("leadForm", "occasion_placeholder", "Ví dụ: quà Tết, quà đối tác, tiệc công ty...")} />
        {fieldError("occasion")}
      </label>

      <label>
        {t("leadForm", "notes", "Yêu cầu chi tiết")}
        <textarea
          suppressHydrationWarning
          {...fieldProps("notes")}
          rows={5}
          maxLength={MAX_TEXT}
          placeholder={t("leadForm", "notes_placeholder", "Bạn có thể mô tả khẩu vị, món không muốn dùng, kiểu đóng gói, thời gian cần nhận hàng hoặc yêu cầu in thiệp/logo...")}
        />
        {fieldError("notes")}
      </label>

      <button suppressHydrationWarning type="submit" disabled={loading}>
        {loading ? t("cart", "submitting", "Đang gửi...") : t("leadForm", "submit", "Gửi yêu cầu đặt hàng")}
      </button>

      {sent && (
        <p className="form-status success" role="status" style={{ marginTop: "16px" }}>
          {t("leadForm", "sent", "Đã ghi nhận thông tin. Nhân viên Sơn La Food sẽ liên hệ lại để tư vấn set phù hợp và xác nhận yêu cầu đặt hàng.")}
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

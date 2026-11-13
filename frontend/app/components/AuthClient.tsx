"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { loginCustomer, registerCustomer, safeNextPath, useCurrentCustomer } from "@/lib/customerSession";
import { useI18n } from "./I18nProvider";

type AuthClientProps = {
  mode: "login" | "register";
};

type FieldName = "name" | "phone" | "birthday" | "address" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Ngày hôm nay theo giờ máy khách, dạng YYYY-MM-DD (giới hạn ô ngày sinh)
function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function AuthClient({ mode }: AuthClientProps) {
  const router = useRouter();
  const { href, t } = useI18n();
  const { customer, loading: customerLoading } = useCurrentCustomer();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);
  const isRegister = mode === "register";

  function nextPath() {
    return safeNextPath(new URLSearchParams(window.location.search).get("next"), href("/tai-khoan"));
  }

  // Đã đăng nhập sẵn mà mở /dang-nhap hoặc /dang-ky → chuyển sang tài khoản (hoặc ?next=)
  useEffect(() => {
    if (!customerLoading && customer && !submittedRef.current) router.replace(nextPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerLoading, customer]);

  function validate(formData: FormData): FieldErrors {
    const value = (name: FieldName) => String(formData.get(name) || "").trim();
    const errors: FieldErrors = {};
    if (isRegister) {
      if (!value("name")) errors.name = t("auth", "error_name", "Vui lòng nhập họ và tên.");
      if (!value("phone")) errors.phone = t("auth", "error_phone", "Vui lòng nhập số điện thoại.");
      else if (!/^\d{9,11}$/.test(value("phone").replace(/[\s.-]/g, ""))) errors.phone = t("auth", "error_phone_invalid", "Số điện thoại không hợp lệ.");
      if (!value("address")) errors.address = t("auth", "error_address", "Vui lòng nhập địa chỉ nhận hàng.");
      const birthday = value("birthday");
      if (birthday && birthday > todayIso()) errors.birthday = t("auth", "error_birthday_future", "Ngày sinh không được ở tương lai.");
    }
    if (!value("email")) errors.email = t("auth", "error_email", "Vui lòng nhập email.");
    else if (!EMAIL_PATTERN.test(value("email"))) errors.email = t("auth", "error_email_invalid", "Email không hợp lệ.");
    const password = String(formData.get("password") || "");
    if (!password) errors.password = t("auth", "error_password", "Vui lòng nhập mật khẩu.");
    else if (isRegister && password.length < 6) errors.password = t("auth", "error_password_short", "Mật khẩu cần tối thiểu 6 ký tự.");
    if (isRegister) {
      const confirmPassword = String(formData.get("confirmPassword") || "");
      if (!confirmPassword) errors.confirmPassword = t("auth", "error_confirm", "Vui lòng nhập lại mật khẩu.");
      else if (password && confirmPassword !== password) errors.confirmPassword = t("auth", "error_confirm_mismatch", "Mật khẩu xác nhận chưa khớp.");
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validate(formData);
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      setError(t("auth", "error_fields", "Vui lòng kiểm tra các trường được đánh dấu."));
      form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    setLoading(true);
    submittedRef.current = true;
    try {
      if (isRegister) {
        await registerCustomer({
          name: String(formData.get("name") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          address: String(formData.get("address") || "").trim(),
          birthday: String(formData.get("birthday") || ""),
          email,
          password,
        });
        setSuccess(t("auth", "register_success", "Đăng ký thành công. Thông tin của bạn sẽ được tự động điền vào form đặt hàng."));
      } else {
        await loginCustomer({ email, password });
        setSuccess(t("auth", "login_success", "Đăng nhập thành công. Đang chuyển trang..."));
      }

      // ?next= giữ nguyên tiền tố ngôn ngữ; chỉ nhận đường dẫn nội bộ
      router.push(nextPath());
    } catch (caughtError) {
      submittedRef.current = false;
      setError(caughtError instanceof Error ? caughtError.message : t("auth", "error_generic", "Chưa thể xử lý yêu cầu. Vui lòng thử lại."));
      setLoading(false);
    }
  }

  function fieldProps(name: FieldName) {
    const message = fieldErrors[name];
    return {
      name,
      "aria-invalid": message ? true : undefined,
      "aria-describedby": message ? `auth-error-${name}` : undefined,
      onInput: () => {
        if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }));
      },
    };
  }

  function fieldError(name: FieldName) {
    const message = fieldErrors[name];
    return message ? <small className="auth-field-error" id={`auth-error-${name}`}>{message}</small> : null;
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-copy">
          <div>
            <p className="eyebrow">{t("auth", "brand", "Tài khoản Sơn La Food")}</p>
            <h2>{isRegister ? t("auth", "register_title", "Tạo tài khoản mua hàng") : t("auth", "login_title", "Đăng nhập tài khoản")}</h2>
            <p>
              {isRegister
                ? t("auth", "register_description", "Lưu thông tin nhận hàng, đặt combo đặc sản nhanh hơn và theo dõi trạng thái từng đơn hàng.")
                : t("auth", "login_description", "Truy cập hồ sơ cá nhân, chỉnh thông tin nhận hàng và theo dõi các đơn hàng đã đặt.")}
            </p>
          </div>
          <div className="auth-benefit-list">
            <span>{t("auth", "benefit_personal", "Thông tin cá nhân")}</span>
            <span>{t("auth", "benefit_address", "Địa chỉ nhận hàng")}</span>
            <span>{t("auth", "benefit_history", "Lịch sử đơn hàng")}</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-heading">
            <h3>{isRegister ? t("auth", "register", "Đăng ký") : t("auth", "login", "Đăng nhập")}</h3>
            <p>
              {isRegister
                ? t("auth", "register_hint", "Thông tin dùng để giao hàng và liên hệ xác nhận đơn.")
                : t("auth", "login_hint", "Dùng email và mật khẩu đã đăng ký trước đó.")}
            </p>
          </div>

          {isRegister && (
            <>
              <label>
                <span>{t("auth", "field_name", "Họ và tên")} *</span>
                <input {...fieldProps("name")} placeholder={t("form", "name_placeholder", "Nguyễn Minh Anh")} autoComplete="name" maxLength={120} />
                {fieldError("name")}
              </label>
              <div className="auth-form-row">
                <label>
                  <span>{t("auth", "field_phone", "Số điện thoại")} *</span>
                  <input {...fieldProps("phone")} type="tel" placeholder="09xx xxx xxx" autoComplete="tel" />
                  {fieldError("phone")}
                </label>
                <label>
                  <span>{t("auth", "field_birthday", "Ngày sinh")}</span>
                  <input {...fieldProps("birthday")} type="date" autoComplete="bday" min="1900-01-01" max={todayIso()} />
                  {fieldError("birthday")}
                </label>
              </div>
              <label>
                <span>{t("auth", "field_address", "Địa chỉ nhận hàng")} *</span>
                <input {...fieldProps("address")} placeholder={t("cart", "field_address_placeholder", "Số nhà, phường/xã, tỉnh/thành")} autoComplete="street-address" maxLength={500} />
                {fieldError("address")}
              </label>
            </>
          )}

          <label>
            <span>Email *</span>
            <input {...fieldProps("email")} type="email" placeholder="email@example.com" autoComplete="email" />
            {fieldError("email")}
          </label>

          <label>
            <span>{t("auth", "field_password", "Mật khẩu")} *</span>
            <input {...fieldProps("password")} type="password" placeholder={isRegister ? t("auth", "password_placeholder", "Tối thiểu 6 ký tự") : ""} autoComplete={isRegister ? "new-password" : "current-password"} />
            {fieldError("password")}
          </label>

          {isRegister && (
            <label>
              <span>{t("auth", "field_confirm", "Xác nhận mật khẩu")} *</span>
              <input {...fieldProps("confirmPassword")} type="password" placeholder={t("auth", "confirm_placeholder", "Nhập lại mật khẩu")} autoComplete="new-password" />
              {fieldError("confirmPassword")}
            </label>
          )}

          {error && <p className="auth-message error" role="alert">{error}</p>}
          {success && <p className="auth-message success" role="status">{success}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? t("auth", "processing", "Đang xử lý...") : isRegister ? t("auth", "create_account", "Tạo tài khoản") : t("auth", "login", "Đăng nhập")}
          </button>

          <p className="auth-switch">
            {isRegister ? t("auth", "have_account", "Đã có tài khoản?") : t("auth", "no_account", "Chưa có tài khoản?")}{" "}
            <Link href={href(isRegister ? "/dang-nhap" : "/dang-ky")}>{isRegister ? t("auth", "login", "Đăng nhập") : t("auth", "register_now", "Đăng ký ngay")}</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

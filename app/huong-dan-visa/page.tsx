import { PageDisabled } from "../components/PageDisabled";

export const metadata = {
  title: "Trang không sử dụng | Sơn La Food",
  robots: { index: false, follow: false },
};

export default function VisaGuidePage() {
  return <PageDisabled pageName="Trang không sử dụng" />;
}
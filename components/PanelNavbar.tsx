import Navbar from "./Navbar";
import { getPanelLocale } from "@/lib/i18n/panelLocale";

export default function PanelNavbar() {
  const locale = getPanelLocale();

  return <Navbar locale={locale} />;
}

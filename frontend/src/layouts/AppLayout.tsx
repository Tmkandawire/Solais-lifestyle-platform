import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/common/ScrollToTop";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <ScrollToTop />

      <Navbar />

      <main className="pt-20 md:pt-24">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { productService } from "@/services/productService";
import { exportToExcel } from "@/utils/exportUtils";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  const handleExport = async () => {
    setExporting(true);
    try {
      const products = await productService.getAll();
      if (products.length === 0) {
        navigate("/products");
        return;
      }
      await exportToExcel(products, "controle-validade");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header onMenuToggle={() => setMobileOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile, shown as overlay when mobileOpen */}
        <div
          className={`
            fixed md:relative z-40 h-full md:h-auto
            transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{ top: "var(--header-h)" }}
        >
          <div className="h-full">
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((v) => !v)}
              onExport={handleExport}
              exporting={exporting}
            />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6 py-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

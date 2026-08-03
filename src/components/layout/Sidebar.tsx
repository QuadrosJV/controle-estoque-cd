import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onExport: () => void;
  exporting?: boolean;
}

const NAV_ITEMS = [
  { to: "/",        icon: LayoutDashboard, label: "Dashboard",   end: true  },
  { to: "/products",icon: Package,          label: "Produtos",    end: false },
  { to: "/alerts",  icon: AlertTriangle,    label: "Alertas",     end: false },
  { to: "/reports", icon: FileSpreadsheet,  label: "Relatórios",  end: false },
];

export default function Sidebar({
  collapsed,
  onToggle,
  onExport,
  exporting,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col bg-white border-r border-[var(--color-border)] shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Nav links */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-blue-light)] text-[var(--color-blue)]"
                  : "text-[var(--color-text-soft)] hover:bg-[var(--color-gray-light)] hover:text-[var(--color-text)]"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`shrink-0 ${isActive ? "text-[var(--color-blue)]" : ""}`}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Export Excel action */}
        <button
          onClick={onExport}
          disabled={exporting}
          title={collapsed ? "Exportar Excel" : undefined}
          className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[var(--color-text-soft)] hover:bg-[var(--color-gray-light)] hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${collapsed ? "justify-center" : ""}`}
        >
          <FileDown size={18} className="shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {exporting ? "Exportando..." : "Exportar Excel"}
            </span>
          )}
        </button>
      </nav>

      {/* Collapse toggle */}
      <div className="py-3 px-2 border-t border-[var(--color-border)]">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-[var(--color-text-soft)] hover:bg-[var(--color-gray-light)] transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span>Recolher menu</span>}
        </button>
      </div>
    </aside>
  );
}

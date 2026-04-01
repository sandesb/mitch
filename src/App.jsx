import { useMemo, useState } from "react";
import { CreditCard, Home, LayoutDashboard, Menu, MessageSquare, Settings } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/PlaceholderPage";

const MENU_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "message", label: "Message", icon: MessageSquare, badge: 23 },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "settings", label: "Settings", icon: Settings },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pageContent = useMemo(() => {
    if (activePage === "dashboard") {
      return <Dashboard />;
    }

    const title = MENU_ITEMS.find((item) => item.key === activePage)?.label || "Page";
    return (
      <PlaceholderPage
        title={title}
        description={`This is a placeholder ${title.toLowerCase()} page.`}
      />
    );
  }, [activePage]);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className={`sidebar-brand ${sidebarCollapsed ? "hidden" : ""}`}>Energy</div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            <Menu size={16} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link ${activePage === item.key ? "active" : ""}`}
              onClick={() => setActivePage(item.key)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={16} className="sidebar-icon" />
              <span className={`sidebar-label ${sidebarCollapsed ? "hidden" : ""}`}>{item.label}</span>
              {item.badge ? <span className="sidebar-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content-area">{pageContent}</main>
    </div>
  );
}

export default App;

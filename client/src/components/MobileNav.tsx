import { LayoutDashboard, Receipt, Wallet, Briefcase, Settings } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Budgets", url: "/budgets", icon: Wallet },
  { title: "Business", url: "/business", icon: Briefcase },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.url;
          return (
            <button
              key={item.url}
              onClick={() => setLocation(item.url)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 hover-elevate ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`button-nav-${item.title.toLowerCase()}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

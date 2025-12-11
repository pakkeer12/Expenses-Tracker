import {
  LayoutDashboard,
  Wallet,
  User,
  LogOut,
  CreditCard,
  Settings as SettingsIcon,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Wallet,
  },
  {
    title: "Loans",
    url: "/loans",
    icon: CreditCard,
  },
  {
    title: "Business",
    url: "/business",
    icon: Briefcase,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const getInitials = (name?: string | null, username?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return username ? username.slice(0, 2).toUpperCase() : "U";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-4">
            Expense Tracker
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} onClick={() => setLocation(item.url)} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            <AvatarFallback>{getInitials(user?.name, user?.username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || user?.username || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

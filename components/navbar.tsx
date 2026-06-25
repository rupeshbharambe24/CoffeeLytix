"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BeanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  NotebookTextIcon,
  PlusIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/entries", label: "Entries", icon: NotebookTextIcon },
  { href: "/beans", label: "Beans", icon: BeanIcon },
  { href: "/cafes", label: "Cafés", icon: StoreIcon },
  { href: "/equipment", label: "Equipment", icon: WrenchIcon },
  { href: "/compare", label: "Compare", icon: UsersIcon },
];

// Shown in the mobile bottom bar; the rest live behind "More".
const MOBILE_PRIMARY = ["/dashboard", "/entries", "/beans"];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
}

function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const name = profile?.displayName || user?.displayName || "Coffee Lover";

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Account menu"
          />
        }
      >
        <Avatar>
          {user?.photoURL && <AvatarImage src={user.photoURL} alt={name} />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{name}</span>
          {user?.email && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreMenu() {
  const router = useRouter();
  const isActive = useIsActive();
  const items = NAV_ITEMS.filter((i) => !MOBILE_PRIMARY.includes(i.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground"
            aria-label="More"
          />
        }
      >
        <MoreHorizontalIcon className="size-5" />
        <span className="text-[10px] font-medium">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-44">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(isActive(item.href) && "text-primary")}
          >
            <item.icon /> {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const isActive = useIsActive();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/dashboard" className="shrink-0">
            <Logo className="hidden sm:inline-flex" />
            <Logo className="sm:hidden" showText={false} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              render={<Link href="/entries/new" />}
              className="hidden sm:inline-flex"
            >
              <PlusIcon className="size-4" /> Log coffee
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
          {NAV_ITEMS.filter((i) => MOBILE_PRIMARY.includes(i.href))
            .slice(0, 2)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}

          <Link
            href="/entries/new"
            aria-label="Log coffee"
            className="flex flex-1 flex-col items-center justify-center"
          >
            <span className="grid size-12 -translate-y-3 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
              <PlusIcon className="size-6" />
            </span>
          </Link>

          <Link
            href="/beans"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5",
              isActive("/beans") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <BeanIcon className="size-5" />
            <span className="text-[10px] font-medium">Beans</span>
          </Link>

          <MoreMenu />
        </div>
      </nav>
    </>
  );
}

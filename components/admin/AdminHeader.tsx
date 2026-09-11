"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_PROFILE } from "@/lib/admin-data";
import { findNavItem } from "@/lib/admin-nav";

import TextReveal from "@/components/motion/TextReveal";
import ThemeToggle from "@/components/system/ThemeToggle";
export function AdminHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const title = current?.title ?? "Admin";
  const crumb = current?.crumb ?? "";

  return (
    <header className="sticky top-0 z-30 bg-admin-bg/85 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Open navigation menu"
          aria-controls="admin-sidebar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white dark:bg-admin-card text-admin-ink shadow-admin md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <TextReveal as="h1" className="truncate text-2xl font-semibold tracking-tight text-admin-ink">
            {title}
          </TextReveal>
          <nav aria-label="Breadcrumb" className="mt-0.5">
            <ol className="flex list-none items-center gap-1 text-xs text-admin-muted">
              <li>
                <Link href="/admin/dashboard" className="hover:text-admin-ink">
                  Admin
                </Link>
              </li>
              {crumb ? (
                <>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3 w-3" />
                  </li>
                  <li className="font-medium text-admin-ink">{crumb}</li>
                </>
              ) : null}
            </ol>
          </nav>
        </div>

        <div className="order-last w-full sm:order-none sm:w-auto sm:max-w-xs md:max-w-sm sm:flex-1">
          <label htmlFor="admin-search" className="sr-only">
            Search patients, staff and invoices
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
              aria-hidden="true"
            />
            <input
              id="admin-search"
              type="search"
              placeholder="Search patients, staff, invoices..."
              className="h-11 w-full rounded-full border border-transparent bg-white dark:bg-admin-card pl-11 pr-4 text-sm text-admin-ink placeholder:text-admin-muted shadow-admin transition-colors duration-200 focus:border-admin-pink focus:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white dark:bg-admin-card text-admin-ink shadow-admin transition-colors duration-200 hover:text-admin-pink"
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-admin-pink ring-2 ring-white"
            />
          </button>

          <button
            type="button"
            aria-label="Messages"
            className="grid h-10 w-10 place-items-center rounded-full bg-white dark:bg-admin-card text-admin-ink shadow-admin transition-colors duration-200 hover:text-admin-pink"
          >
            <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          <ThemeToggle className="hidden sm:flex" />

          <span
            aria-hidden="true"
            className="mx-1 hidden h-7 w-px bg-admin-line sm:block"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full bg-white dark:bg-admin-card py-1.5 pl-1.5 pr-3 text-left shadow-admin transition-colors duration-200 hover:bg-white/80"
              >
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-admin-grad-pink text-xs font-semibold text-white"
                >
                  {ADMIN_PROFILE.initials}
                </span>
                <span className="hidden text-sm font-medium text-admin-ink sm:block">
                  {ADMIN_PROFILE.firstName}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-admin-muted"
                  aria-hidden="true"
                />
                <span className="sr-only">Open account menu</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{ADMIN_PROFILE.name}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600 data-[highlighted]:bg-rose-50">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;

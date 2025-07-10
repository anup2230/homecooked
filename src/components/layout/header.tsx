"use client"

import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { Search } from "lucide-react"

export function Header() {
  // Mock logged-in state. We'll toggle between a cook and a consumer.
  const isLoggedIn = true; 
  // Set to true for a cook, false for a consumer to see the difference.
  const isCook = true; 

  const consumerUser = { name: "Alice Johnson", email: "alice.j@example.com", avatarUrl: "https://placehold.co/100x100.png" };
  const cookUser = { name: "Nonna Isabella", email: "nonna.isabella@example.com", avatarUrl: "https://placehold.co/100x100.png" };
  const user = isCook ? cookUser : consumerUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/discover"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Discover
            </Link>
            <Link
              href="/sell"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Sell Food
            </Link>
             <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
        </div>
        
        {/* Mobile Nav Trigger can be added here */}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for dishes..."
                  className="pl-8 sm:w-64 md:w-80"
                />
              </div>
            </form>
          </div>
          <nav className="flex items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={isCook ? "/profile/cook" : "/profile/me"} className="w-full">
                      {isCook ? "My Kitchen" : "My Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders" className="w-full">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                 <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
                 <Button asChild><Link href="/signup">Sign Up</Link></Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

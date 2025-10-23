'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, X, Search, Moon, Sun, User, LogOut, Heart, History, Home, Film, List, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useStore from '@/lib/store';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/genres', label: 'Genres', icon: List },
    { href: '/about', label: 'About', icon: Film },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10">
              <Logo size={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              DannNime
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      Watch History
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-purple-600">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Actions */}
            <div className="pt-4 border-t">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Avatar>
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-purple-600"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-red-600 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
              )}
              
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  toggleTheme();
                  setIsOpen(false);
                }}
              >
                {theme === 'dark' ? (
                  <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
                ) : (
                  <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

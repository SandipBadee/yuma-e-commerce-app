"use client";
import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  Search, 
  ChevronRight, 
  Leaf, 
  User, // Added for Profile icon
  LogOut // Added for Logout icon
} from "lucide-react";
import { useSession, signOut } from "next-auth/react"; // 1. Import NextAuth hooks
import { CartContext } from "@/context/CartContext";
import { Button } from "./ui/Button";

const CATEGORY_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession(); // 2. Access session state
  const { cartCount, setIsCartOpen } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch(`${CATEGORY_API_BASE}/api/category`, {
          method: "GET",
          cache: "no-store"
        });
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        if (!cancelled) {
          setCategories(Array.isArray(data?.categories) ? data.categories : []);
        }
      } catch (_error) {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavClick = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleNavClick(`/search?q=${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-white py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </Button>
            </div>

            {/* Logo */}
            <div
              className="flex-1 lg:flex-none flex justify-center lg:justify-start items-center cursor-pointer group"
              onClick={() => handleNavClick("/")}
            >
              <Image src="/logo.png" alt="YUMA Ecommerce" width={180} height={40} className="h-12 w-auto" priority />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => handleNavClick("/")}
                className="font-medium transition-colors text-stone-600 hover:text-red-800"
              >
                Home
              </button>
              <div className="relative group">
                <button
                  onClick={() => handleNavClick("/categories")}
                  className="font-medium transition-colors text-stone-600 hover:text-red-800 flex items-center gap-1"
                >
                  Categories <ChevronRight size={16} className="rotate-90" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        onClick={() => handleNavClick(`/categories/${cat.slug}`)}
                        className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-red-800"
                      >
                        {cat.name}
                      </button>
                    ))}
                    <button
                      onClick={() => handleNavClick("/categories")}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 border-t border-stone-100 mt-1 pt-2"
                    >
                      View All Categories
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (Search, Login/Profile, Cart) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="bg-stone-100 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:bg-white border border-transparent focus:border-red-800/30 w-64 transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
              </div>

              {/* 3. Conditional Rendering for Login/Profile */}
              {status === "authenticated" ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-stone-700 hover:text-red-800"
                    onClick={() => handleNavClick("/profile")}
                  >
                    <User size={20} />
                    <span className="hidden md:inline font-medium text-sm">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </Button>
                  {/* Dropdown for Logout */}
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0">
                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick("/profile")}
                        className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-50"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick("/login")}
                  className="hidden sm:inline-flex text-stone-700 hover:text-red-800"
                >
                  Login
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative text-stone-700"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={24} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-500 text-stone-900 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 bg-stone-900/50 z-50 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 flex items-center justify-between border-b border-stone-100">
            <div className="flex items-center">
              <Leaf className="text-red-800 mr-2" size={24} />
              <span className="font-bold text-xl text-stone-800">Menu</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </Button>
          </div>
          <div className="p-4 space-y-1">
            <button
              onClick={() => handleNavClick("/")}
              className="w-full text-left px-4 py-3 rounded-xl font-medium text-stone-700 hover:bg-stone-50 hover:text-red-800"
            >
              Home
            </button>
            
            {/* Mobile Auth Button */}
            {status === "authenticated" ? (
              <button
                onClick={() => handleNavClick("/profile")}
                className="w-full text-left px-4 py-3 rounded-xl font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <User size={18} /> My Account
              </button>
            ) : (
              <button
                onClick={() => handleNavClick("/login")}
                className="w-full text-left px-4 py-3 rounded-xl font-medium text-stone-700 hover:bg-stone-50"
              >
                Login / Register
              </button>
            )}

            <button
              onClick={() => handleNavClick("/categories")}
              className="w-full text-left px-4 py-3 rounded-xl font-medium text-stone-700 hover:bg-stone-50 hover:text-red-800"
            >
              Browse Categories
            </button>

            <div className="px-4 pt-1 pb-2">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Categories</p>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => handleNavClick(`/categories/${cat.slug}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 hover:text-red-800"
                  >
                    {cat.name}
                  </button>
                ))}

                {categories.length === 0 && (
                  <p className="text-xs text-stone-500 px-3 py-1">No categories available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20"></div>
    </>
  );
}
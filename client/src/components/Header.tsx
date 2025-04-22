import { useState } from "react";
import { Link } from "wouter";
import { Layers, Menu, X } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2 cursor-pointer">
            <Layers className="text-primary h-6 w-6" />
            <h1 className="text-xl font-display font-semibold text-gray-900">AI Travel Planner</h1>
          </a>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/">
            <a className="text-gray-700 hover:text-primary font-medium">Home</a>
          </Link>
          <Link href="/explore">
            <a className="text-gray-700 hover:text-primary font-medium">Explore</a>
          </Link>
          <Link href="/my-trips">
            <a className="text-gray-700 hover:text-primary font-medium">My Trips</a>
          </Link>
          <Link href="/about">
            <a className="text-gray-700 hover:text-primary font-medium">About</a>
          </Link>
        </nav>
        
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button type="button" className="text-gray-700 hover:text-primary" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Layers className="text-primary h-5 w-5" />
                  AI Travel Planner
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/">
                  <a className="text-gray-700 hover:text-primary font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </a>
                </Link>
                <Link href="/explore">
                  <a className="text-gray-700 hover:text-primary font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    Explore
                  </a>
                </Link>
                <Link href="/my-trips">
                  <a className="text-gray-700 hover:text-primary font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    My Trips
                  </a>
                </Link>
                <Link href="/about">
                  <a className="text-gray-700 hover:text-primary font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    About
                  </a>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

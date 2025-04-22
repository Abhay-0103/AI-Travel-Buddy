import { Layers, Facebook, Twitter, Instagram, Linkedin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="text-primary-400 h-6 w-6" />
              <h2 className="text-xl font-display font-semibold text-white">AI Travel Planner</h2>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              Your intelligent travel assistant that creates personalized itineraries powered by AI technology.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="text-gray-400 hover:text-white text-sm">About Us</a></Link></li>
              <li><Link href="/team"><a className="text-gray-400 hover:text-white text-sm">Our Team</a></Link></li>
              <li><Link href="/careers"><a className="text-gray-400 hover:text-white text-sm">Careers</a></Link></li>
              <li><Link href="/press"><a className="text-gray-400 hover:text-white text-sm">Press</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/guides"><a className="text-gray-400 hover:text-white text-sm">Travel Guides</a></Link></li>
              <li><Link href="/faq"><a className="text-gray-400 hover:text-white text-sm">FAQs</a></Link></li>
              <li><Link href="/support"><a className="text-gray-400 hover:text-white text-sm">Support</a></Link></li>
              <li><Link href="/privacy"><a className="text-gray-400 hover:text-white text-sm">Privacy Policy</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white focus:ring-primary"
                />
                <Button variant="default" className="rounded-l-none bg-primary hover:bg-primary-700 text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Travel Planner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

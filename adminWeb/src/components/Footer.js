import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 border-t-4 border-red-800">

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo + Description */}
        <div>
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_full.png"
              alt="YUMA Ecommerce"
              width={280}
              height={80}
              className="h-16 w-auto"
              priority={false}
            />
          </div>
          <p className="mb-6 max-w-sm mx-auto text-center">
            Bringing premium grocery essentials straight to your kitchen with trusted quality and convenience.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/categories/all" className="hover:text-amber-400 transition-colors">
                All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Location + Opening Hours */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Location
          </h4>
          <ul className="space-y-3">

            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-red-500 mt-0.5" />
              <span>
                Näyttelijäntie 14C, 00400,<br />Helsinki
              </span>
            </li>

            <li className="flex items-start gap-3">
              <Clock size={18} className="text-red-500 mt-0.5" />
              <span>
                Mon - Fri: 11 AM - 10 PM <br />
                Sat - Sun: 12 PM - 10 PM
              </span>
            </li>

          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">
            Contact Us
          </h4>
          <ul className="space-y-3">

            {/* Phone */}
            <li className="flex items-start gap-3">
              <Phone size={18} className="text-red-500 mt-0.5" />
              <span>+358 41 3297997</span>
            </li>

            {/* Email */}
            <li className="flex items-center gap-3">
              <Mail size={20} className="text-red-500 shrink-0" aria-hidden="true" />
              <span>info@yumaecommerce.com</span>
           </li>

          </ul>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 flex justify-center items-center text-sm text-center">
        <p>
          &copy; {new Date().getFullYear()} YUMA Ecommerce. All rights reserved.
        </p>
      </div>

    </footer>
  );
}
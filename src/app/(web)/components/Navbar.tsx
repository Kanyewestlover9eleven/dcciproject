"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-[#4B5043] text-[#FDFFFC]">
      {/* Left side: your logo */}
      <Link href="/" className="flex items-center gap-2">
          <Image
            src="/dcci.png"
            alt="My Logo"
            width={100}
            height={100}
            className="mr-2"
          />
          <span className="font-bold text-lg">DAYAK CHAMBER OF COMMERCE AND INDUSTRY</span>
      </Link>

      {/* Right side: your links */}
      <div className="flex gap-4">
        <Link href="/">
          Home
        </Link>
        <Link href="/directories">
          Directories
        </Link>
        <Link href="/media">
          Media
        </Link>
        <Link href="/activities">
          Activities
        </Link>
        <Link href="/facilities">
          Facilities
        </Link>
        <Link href="/contact">
          Contact Us
        </Link>
      </div>
    </nav>
  );
}
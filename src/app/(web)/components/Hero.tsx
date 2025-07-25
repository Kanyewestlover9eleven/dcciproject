"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-[95vh] flex items-center justify-center text-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/building.png"
          alt="Construction site"
          fill
          className="object-cover brightness-75"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-4 space-y-6">
        <h1 className="text-5xl font-extrabold text-white">
          Dayak Chamber of Commerce and Industry
        </h1>
        <Link
          href="/contact"
          className="inline-block bg-[#4DAA57] hover:bg-[#4DAA57] text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}

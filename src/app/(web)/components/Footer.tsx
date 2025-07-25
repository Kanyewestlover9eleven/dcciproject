// src/app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-start justify-between p-4 bg-[#4B5043] text-[#FDFFFC]">
      <span className="text-lg font-bold">DCCI</span>
      <div className="space-y-1 text-white text-xs">
        <p>
          <strong>Address:</strong> Panggau Dayak Tower B, Jalan Ong Tiang Swee,
          Taman Liong Seng, 93200 Kuching, Sarawak
        </p>
        <p>
          <strong>Phone:</strong> +60 82-123456
        </p>
        <p>
          <strong>Email:</strong> dcci.secretariat@gmail.com
        </p>

        {/* Login button tucked below the email */}
        <Link
          href="/login"
          className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded border border-white bg-[#4B5043] text-white hover:opacity-90 transition"
        >
          Secretriat login
        </Link>
      </div>
    </footer>
  );
}

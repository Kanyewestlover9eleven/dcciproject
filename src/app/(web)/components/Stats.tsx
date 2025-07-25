// src/app/dashboard/Stats.tsx
"use client";

import Image from "next/image";

const images = [
  { src: "/council.png",   alt: "Advisors",   title: "Our Advisors" },
  { src: "/secretriat.png",  alt: "Appointed",  title: "Secretriat Team" },
];

export default function Stats() {
  return (
    <section className="py-16">
      <div className="max-w-xl mx-auto flex flex-col items-center space-y-12">
        {images.map((img) => (
          <div key={img.src} className="w-full text-center">
            <h2 className="text-2xl font-semibold mb-4">{img.title}</h2>
            <Image
              src={img.src}
              alt={img.alt}
              width={900}
              height={550}
              className="rounded-lg shadow-lg object-cover w-full"
            />

            {/* Insert one of these paragraphs below: */}
            {img.src === "/council.png" && (
              <p className="mt-4 text-gray-700">
                Our esteemed Panel of Advisors brings together senior leaders and industry veterans who guide DCCI’s strategic direction, share invaluable expertise, and champion the Dayak business community in high-level forums.
              </p>
            )}
            {img.src === "/secretriat.png" && (
              <p className="mt-4 text-gray-700">
                Our Appointed Members are sector experts and committee chairs, responsible for executing targeted projects, organizing specialist events, and connecting fellow Dayak entrepreneurs with the resources they need to succeed.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

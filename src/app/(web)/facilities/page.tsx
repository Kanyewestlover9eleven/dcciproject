// src/app/(web)/facilities/page.tsx
"use client";

import Image from "next/image";

const facilities = [
  {
    title: "Meeting Room A",
    desc: "Fits 500–800 pax, audio/visual suite included.",
    img: "/theatre.png",
    link: "/booking?room=A"
  },
  {
    title: "Conference Hall B",
    desc: "Up to 200 pax, stage + lighting.",
    img: "/cluster.png",
    link: "/booking?room=B"
  },
  {
    title: "Conference Hall C",
    desc: "Up to 200 pax, stage + lighting.",
    img: "/conference.png",
    link: "/booking?room=B"
  },
  // …
];

export default function FacilitiesPage() {
  return (
    <section className="py-12 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">Our Facilities</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {facilities.map((f) => (
          <div key={f.title} className="bg-white rounded shadow overflow-hidden">
            <div className="relative h-80 w-full">
              <Image
                src={f.img}
                alt={f.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold mb-2">{f.title}</h2>
              <p className="text-gray-600 mb-4">{f.desc}</p>
              <a
                href={f.link}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Book Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

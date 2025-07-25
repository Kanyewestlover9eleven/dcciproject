// src/app/(web)/media/page.tsx
"use client";
import Image from "next/image";

type Release = { src: string; title: string; description: string };

const releases: Release[] = [
  { src: "/meeting.png", title: "Launch Event", description: "DCCI launched..." },
  { src: "/golf.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/agm.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/business.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/gawai.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/official.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/women.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/talk.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/cowboy.png", title: "Award Ceremony", description: "We honored..." },
  { src: "/franchise.png", title: "Award Ceremony", description: "We honored..." },
  // add more …
];

export default function MediaPage() {
  return (
    <section className="py-12 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">Press & Media</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {releases.map((r) => (
          <div key={r.src} className="bg-white rounded shadow overflow-hidden">
            <Image
              src={r.src}
              alt={r.title}
              width={500}
              height={350}
              className="object-cover w-full h-50"
            />
            <div className="p-4">
              <h2 className="font-semibold mb-2">{r.title}</h2>
              <p className="text-gray-600 text-sm">{r.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// src/app/(web)/media/page.tsx
import Image from "next/image";
import { fetchMediaItems, MediaItem } from "@/lib/strapi";

export const revalidate = 60; // ISR

export default async function MediaPage() {
  const items: MediaItem[] = await fetchMediaItems();

  return (
    <section className="py-12 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">Press & Media</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {items.map(({ id, title, description, imageUrl, altText }) => (
          <div key={id} className="bg-white rounded shadow overflow-hidden">
            <Image
              src={imageUrl}
              alt={altText ?? title}
              width={500}
              height={350}
              className="object-cover w-full h-50"
            />
            <div className="p-4">
              <h2 className="font-semibold mb-2">{title}</h2>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

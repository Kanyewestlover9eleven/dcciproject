// app/(web)/layout.tsx
import "@/app/globals.css";
import Navbar    from "@/app/(web)/components/Navbar";
import Footer    from "@/app/(web)/components/Footer";
import FaqWidget from "@/app/(web)/components/FaqWidgets";  // ensure filename/casing matches

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {children}
        <FaqWidget />
      </main>

      <Footer />
    </div>
  );
}

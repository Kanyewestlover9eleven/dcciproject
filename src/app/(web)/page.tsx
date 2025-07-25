import Hero from "@/app/(web)/components/Hero";
import About from "@/app/(web)/components/About";
import Stats from "@/app/(web)/components/Stats";

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      <About />
      <Stats />
    </div>
  );
}
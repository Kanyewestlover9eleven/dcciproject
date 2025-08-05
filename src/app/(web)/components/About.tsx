// src/app/(web)/components/About.tsx
"use client";

import Image from "next/image";


export default function About() {
  return (
    <section className="py-16 bg-gray-50 space-y-16">
      {/* Hero / intro */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">About Us</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src="/hero.png"
              alt="Our DCCI Team"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-semibold mb-4">
              Dayak Chamber of Commerce & Industry (DCCI)
            </h3>
            <p className="text-gray-700">
              The Dayak Chamber of Commerce and Industry (DCCI) 
              Sarawak was officially established and registered under the Societies Act, 
              1966 on 11 January 2003. As a pioneering business chamber, DCCI serves as the official voice 
              and platform for the Dayak business community, championing the interests of Dayak entrepreneurs, 
              professionals, and enterprises. It was founded with a clear mission: to promote economic empowerment, 
              foster business development, and advocate for greater Dayak participation in the mainstream economy of 
              Sarawak and Malaysia.
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {/* Vision Panel */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-row gap-6 items-center overflow-hidden">
          {/* <div className="relative w-full h-64 ">
            <Image
              src="/vision.png"       // put a vision-themed PNG/SVG in public/icons/
              alt="Vision"
              fill
              className="object-cover"
            />
          </div> */}
          <h4 className="text-xl font-semibold mb-3">DCCI Vision</h4>
          <p className="text-gray-700 text-center">
            To empower and elevate the Dayak community as a driving force in 
            realizing the goals of PCDS 2030 with a focused commitment to strengthening Bumiputera 
            participation in the commercial and industrial sectors.
          </p>
        </div>

        {/* Mission Panel */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-row gap-6 items-center overflow-hidden">
          {/* <div className="relative w-full h-64 ">
            <Image
              src="/mission.png"      // put a mission-themed PNG/SVG in public/icons/
              alt="Mission"
              fill
              className="object-cover"
            />
          </div> */}
          <h4 className="text-xl font-semibold mb-3">DCCI Mission</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Creating self-reliant and sustainable Dayak entrepreneurs through programs to develop Dayak Commercial and Industrial Community (DCIC);</li>
            <li>Providing an enabling environment for the Dayaks to face the challenges of globalization;</li>
            <li>Promoting effective participation of disadvantaged Dayaks in the knowledge-based economy; </li>
            <li>Ensuring employment participation that reflects the ethnic composition of the Dayak minority groups.</li>
          </ul>
        </div>
      </div>

      {/* Objectives */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
      <h4 className="text-xl font-semibold mb-4">Objectives</h4>

      <dl className="space-y-8">
        <div>
          <dt className="text-lg font-semibold">Support and Advocacy for Members</dt>
          <dd className="mt-2 text-gray-700">
            Act as an umbrella body for Dayak entrepreneurs and professionals, promoting,
            protecting, and preserving their interests, representing them in business forums
            and liaising with relevant authorities.
          </dd>
        </div>

        <div>
          <dt className="text-lg font-semibold">Capacity Building and Knowledge Sharing</dt>
          <dd className="mt-2 text-gray-700">
            Provide training programs, disseminate trade information, and publish resources to prepare members for active business participation and ensure access to critical knowledge.
          </dd>
          <dd className="mt-2 text-gray-700">
            Application of grants to further enhance the well-being of members and the broader community.
          </dd>
        </div>

        <div>
          <dt className="text-lg font-semibold">Collaboration and Networking</dt>
          <dd className="mt-2 text-gray-700">
            Establish links and cooperate with organizations or associations that share similar objectives to foster partnerships and mutual growth.
          </dd>
        </div>

        <div>
          <dt className="text-lg font-semibold">Investment and Resource Management</dt>
          <dd className="mt-2 text-gray-700">
           Set up investment arms, acquire and develop properties, and manage financial resources such as shares, stocks, and bonds to benefit members and support the Chamber sustainability.
          </dd>
        </div>
      </dl>
    </div>


      {/* Milestones & Achievements */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow mt-8">
        <h4 className="text-xl font-semibold mb-4">Milestones &amp; Achievements</h4>
        <ul className="list-disc list-inside space-y-4 text-gray-700">
          <li>
            <strong>10th Anniversary (2013):</strong> Marked a significant milestone—
            ten years of growth, achievement, and commitment as a business chamber
            serving the Dayak community. This celebration honoured our pioneers and
            helped chart a forward-looking path for future challenges.
          </li>
          <li>
            <strong>20th Anniversary (2023):</strong> Celebrated two decades of
            service to the Dayak business community, reflecting on our journey so
            far and setting sights on the next chapter.
          </li>
          <li>
            <strong>Expanding Membership:</strong> Grew our family to over 1,018
            professionals, SMEs, cooperatives, and corporate entities (as of May 2025).
          </li>
          <li>
            <strong>Thought Leadership:</strong> Contributed key perspectives on
            inclusive development, Dayak entrepreneurship, and cultural economic
            integration through papers, panels, and public forums.
          </li>
        </ul>
      </div>
    </section>
  );
}

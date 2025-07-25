// src/app/(web)/contact/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

type RegistrationData = {
  companyName: string;
  companyNumber: string;
  registrationDate: string;

  registeredAddress: string;
  correspondenceAddress: string;
  website: string;
  email: string;
  phone: string;
  fax: string;

  authorisedCapital: string;
  paidUpCapital: string;
  directors: string;

  licenses: {
    cidb: boolean;
    cidbGrade: string;
    cidbSubHeads: string;

    upkjStatus: boolean;
    upkjClass: string;
    upkjSubHeads: string;

    upkStatus: boolean;
    upkClass: string;
    upkSubHeads: string;

    ffo: boolean;
  };

  otherRegistrations: string;
  dayakEquity: string;

  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonPhone: string;
};

type InquiryData = {
  name: string;
  email: string;
  message: string;
};

const initialReg: RegistrationData = {
  companyName: "",
  companyNumber: "",
  registrationDate: "",

  registeredAddress: "",
  correspondenceAddress: "",
  website: "",
  email: "",
  phone: "",
  fax: "",

  authorisedCapital: "",
  paidUpCapital: "",
  directors: "",

  licenses: {
    cidb: false,
    cidbGrade: "",
    cidbSubHeads: "",

    upkjStatus: false,
    upkjClass: "",
    upkjSubHeads: "",

    upkStatus: false,
    upkClass: "",
    upkSubHeads: "",

    ffo: false,
  },

  otherRegistrations: "",
  dayakEquity: "",

  contactPersonName: "",
  contactPersonDesignation: "",
  contactPersonPhone: "",
};

export default function ContactPage() {
  const [reg, setReg] = useState<RegistrationData>(initialReg);
  const [inquiry, setInquiry] = useState<InquiryData>({
    name: "",
    email: "",
    message: "",
  });
  const [isRegOpen, setRegOpen] = useState(false);

  const handleRegChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("licenses.")) {
      const key = name.split(".")[1] as keyof RegistrationData["licenses"];
      setReg((r) => ({
        ...r,
        licenses: {
          ...r.licenses,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setReg((r) => ({ ...r, [name]: value }));
    }
  };

  const handleInquiryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInquiry((i) => ({ ...i, [e.target.name]: e.target.value }));
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      companyName: reg.companyName,
      companyNumber: reg.companyNumber || undefined,
      registrationDate: reg.registrationDate || undefined,

      registeredAddress: reg.registeredAddress,
      correspondenceAddress: reg.correspondenceAddress,
      website: reg.website,
      email: reg.email,
      phone: reg.phone,
      fax: reg.fax,

      authorisedCapital: reg.authorisedCapital,
      paidUpCapital: reg.paidUpCapital,
      dayakEquity: reg.dayakEquity,

      contactPersonName: reg.contactPersonName,
      contactPersonDesignation: reg.contactPersonDesignation,
      contactPersonPhone: reg.contactPersonPhone,

      directors: reg.directors
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d),

      licenses: [
        {
          type: "CIDB",
          gradeOrClass: reg.licenses.cidbGrade,
          subHeads: reg.licenses.cidbSubHeads,
        },
        {
          type: "UPKJ",
          gradeOrClass: reg.licenses.upkjClass,
          subHeads: reg.licenses.upkjSubHeads,
        },
        {
          type: "UPK",
          gradeOrClass: reg.licenses.upkClass,
          subHeads: reg.licenses.upkSubHeads,
        },
        ...(reg.licenses.ffo
          ? [{ type: "FFO", gradeOrClass: null, subHeads: null }]
          : []),
      ].filter((l) => l.type),

      otherRegistrations: reg.otherRegistrations
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o),
    };

    try {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register");
      }
      await res.json();
      alert("Registration successful! Thank you.");
      setReg(initialReg);
      setRegOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Inquiry:", inquiry);
    alert(`Thanks, ${inquiry.name}! We’ll be in touch.`);
    setInquiry({ name: "", email: "", message: "" });
  };

  return (
    <section className="py-16 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-12">Get in Touch</h1>

      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* ─── Register CTA ─── */}
        <section className="bg-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          <div className="w-full md:w-1/3 h-48 relative">
            <Image
              src="/dcci.png"
              alt="Join DCCI"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">
              Member Registration
            </h2>
            <p className="mb-4 text-gray-600">
              Ready to join DCCI? Click below to register as our member.
            </p>
            <button
              onClick={() => setRegOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Register as Member
            </button>
          </div>
        </section>

        {/* ─── Inquiry & Contact Info ─── */}
        <section className="grid gap-12 lg:grid-cols-2">
          {/* General Inquiry */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">General Inquiry</h2>
            <form onSubmit={submitInquiry} className="space-y-4">
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                value={inquiry.name}
                onChange={handleInquiryChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
              />
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                value={inquiry.email}
                onChange={handleInquiryChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
              />
              <textarea
                name="message"
                placeholder="How can we help you?"
                value={inquiry.message}
                onChange={handleInquiryChange}
                required
                rows={4}
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information & Map */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Contact Information
              </h2>
              <p className="mb-2">
                <strong>Address:</strong> Panggau Dayak Tower B, Jalan Ong Tiang
                Swee, Taman Liong Seng, 93200 Kuching, Sarawak
              </p>
              <p className="mb-2">
                <strong>Phone:</strong> +60 82-123456
              </p>
              <p className="mb-2">
                <strong>Email:</strong> dcci.secretariat@gmail.com
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="DCCI Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8168243.048255992!2d100.590624525!3d1.527820900000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba7a06d1fb56d%3A0x17607ecc16badfb4!2sDayak%20Chamber%20of%20Commerce%20and%20Industry!5e0!3m2!1sen!2smy!4v1751525686991!5m2!1sen!2smy"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ─── Registration Modal ─── */}
      {isRegOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="relative bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setRegOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Register Your Company
            </h3>

            <form onSubmit={submitRegistration} className="space-y-6">
              {/* A. Corporate Info */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">A. Corporate Info</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    Name of company
                    <input
                      name="companyName"
                      value={reg.companyName}
                      onChange={handleRegChange}
                      required
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col">
                    Company number
                    <input
                      name="companyNumber"
                      value={reg.companyNumber}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col sm:col-span-2">
                    Date of registration
                    <input
                      name="registrationDate"
                      type="date"
                      value={reg.registrationDate}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                </div>
              </fieldset>

              {/* B. Contact Details */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">B. Contact Details</legend>
                <div className="space-y-4">
                  <label className="flex flex-col">
                    Registered address
                    <textarea
                      name="registeredAddress"
                      value={reg.registeredAddress}
                      onChange={handleRegChange}
                      rows={2}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col">
                    Correspondence address
                    <textarea
                      name="correspondenceAddress"
                      value={reg.correspondenceAddress}
                      onChange={handleRegChange}
                      rows={2}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="flex flex-col">
                      Website
                      <input
                        name="website"
                        type="url"
                        value={reg.website}
                        onChange={handleRegChange}
                        className="border rounded px-2 py-1"
                      />
                    </label>
                    <label className="flex flex-col">
                      E-mail
                      <input
                        name="email"
                        type="email"
                        value={reg.email}
                        onChange={handleRegChange}
                        className="border rounded px-2 py-1"
                      />
                    </label>
                    <label className="flex flex-col">
                      Telephone no.
                      <input
                        name="phone"
                        type="tel"
                        value={reg.phone}
                        onChange={handleRegChange}
                        className="border rounded px-2 py-1"
                      />
                    </label>
                    <label className="flex flex-col">
                      Fax no.
                      <input
                        name="fax"
                        value={reg.fax}
                        onChange={handleRegChange}
                        className="border rounded px-2 py-1"
                      />
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* C. Financial Information */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">C. Financial Information</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    i) Authorised capital
                    <input
                      name="authorisedCapital"
                      value={reg.authorisedCapital}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col">
                    ii) Paid up capital
                    <input
                      name="paidUpCapital"
                      value={reg.paidUpCapital}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                </div>
                <label className="flex flex-col mt-4">
                  Company directors (one per line)
                  <textarea
                    name="directors"
                    value={reg.directors}
                    onChange={handleRegChange}
                    rows={4}
                    className="border rounded px-2 py-1 font-mono"
                  />
                </label>
              </fieldset>

              {/* D. Licenses */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">
                  D. Licenses (✓ + grade/class + sub-heads)
                </legend>
                {[
                  { key: "cidb", label: "CIDB" },
                  { key: "upkjStatus", label: "UPKJ Bumiputera" },
                  { key: "upkStatus", label: "UPK Bumiputera" },
                  { key: "ffo", label: "FFO" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="grid sm:grid-cols-4 items-center gap-2 mb-2"
                  >
                    <label className="flex items-center col-span-2">
                      <input
                        name={`licenses.${key}`}
                        type="checkbox"
                        checked={(reg.licenses as any)[key]}
                        onChange={handleRegChange}
                        className="mr-2"
                      />
                      {label}
                    </label>
                    {key !== "ffo" && (
                      <>
                        <input
                          name={`licenses.${key}Grade`}
                          placeholder="Grade/Class"
                          value={(reg.licenses as any)[`${key}Grade`]}
                          onChange={handleRegChange}
                          className="border rounded px-2 py-1 col-span-1"
                        />
                        <input
                          name={`licenses.${key}SubHeads`}
                          placeholder="Sub-Heads"
                          value={(reg.licenses as any)[`${key}SubHeads`]}
                          onChange={handleRegChange}
                          className="border rounded px-2 py-1 col-span-1"
                        />
                      </>
                    )}
                  </div>
                ))}
              </fieldset>

              {/* E. Other Registration */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">E. Other Registration</legend>
                <textarea
                  name="otherRegistrations"
                  value={reg.otherRegistrations}
                  onChange={handleRegChange}
                  rows={3}
                  className="w-full border rounded px-2 py-1 font-mono"
                  placeholder="One entry per line"
                />
              </fieldset>

              {/* F. Dayak Equity */}
              <fieldset className="border p-4 rounded flex items-center gap-4">
                <legend className="font-semibold">F. Dayak Equity (%)</legend>
                <input
                  name="dayakEquity"
                  value={reg.dayakEquity}
                  onChange={handleRegChange}
                  className="w-24 border rounded px-2 py-1"
                  placeholder="%"
                />
              </fieldset>

              {/* G. Contact Person */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">G. Contact Person</legend>
                <div className="space-y-4">
                  <label className="flex flex-col">
                    i) Name
                    <input
                      name="contactPersonName"
                      value={reg.contactPersonName}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col">
                    ii) Designation
                    <input
                      name="contactPersonDesignation"
                      value={reg.contactPersonDesignation}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                  <label className="flex flex-col">
                    iii) Handphone no.
                    <input
                      name="contactPersonPhone"
                      value={reg.contactPersonPhone}
                      onChange={handleRegChange}
                      className="border rounded px-2 py-1"
                    />
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
              >
                Submit Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

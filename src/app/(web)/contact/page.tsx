// src/app/(web)/contact/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

/** === Complex form types (Sections A–E) === */
type SectionA = {
  applicantName: string;
  icNumber: string;
  dateOfBirth: string;
  permanentAddress: string;
  age: string;
  postalAddress: string;
  contactOffice: string;
  contactEmail: string;
  contactHP: string;
  hometown: string;
  district: string;
  division: string;
};

type SectionB = {
  businessSetup: "GROUP" | "SDN BHD" | "PLT" | "SOLE PROPRIETOR" | "OTHERS";
  businessSetupOther: string;
  companySize: "LARGE" | "MEDIUM" | "SME" | "MICRO-SME";
  mainIndustry: string;
  subIndustry: string;
  orgName: string;
  businessAddress: string;
  businessRegNo: string;
  ownershipName: string;
  highestAcademic: string;
  skillsCert: string;
  licenses: {
    cidb: boolean;
    cidbGrade?: string;
    cidbSubHeads?: string;
    mof: boolean;
    ePerolehan: boolean;
    other?: string;
  };
};

type SectionC = {
  sector: "PUBLIC SECTOR" | "PRIVATE SECTOR";
  serviceTypes: string;
  orgName: string;
  address: string;
  positionDept: string;
  highestAcademic: string;
  skillsCert: string;
  otherQualification: string;
};

type ContactEntry = {
  fullName: string;
  icNumber: string;
  relationship: string;
  profession: string;
  address: string;
  hp: string;
  homePhone: string;
  email: string;
  hometown: string;
  district: string;
  division: string;
};

type SectionD = {
  contacts: [ContactEntry, ContactEntry];
};

type SectionE = {
  proposerName: string;
  proposerSignature: string;
  proposerDate: string;
  seconderName: string;
  seconderSignature: string;
  seconderDate: string;
};

type RegistrationData = {
  isBusinessOwner: boolean;
  sectionA: SectionA;
  sectionB: SectionB;
  sectionC: SectionC;
  sectionD: SectionD;
  sectionE: SectionE;
  declarationAgreed: boolean;
};

type InquiryData = { name: string; email: string; message: string };

const initialReg: RegistrationData = {
  isBusinessOwner: true,
  sectionA: {
    applicantName: "",
    icNumber: "",
    dateOfBirth: "",
    permanentAddress: "",
    age: "",
    postalAddress: "",
    contactOffice: "",
    contactEmail: "",
    contactHP: "",
    hometown: "",
    district: "",
    division: "",
  },
  sectionB: {
    businessSetup: "GROUP",
    businessSetupOther: "",
    companySize: "SME",
    mainIndustry: "",
    subIndustry: "",
    orgName: "",
    businessAddress: "",
    businessRegNo: "",
    ownershipName: "",
    highestAcademic: "",
    skillsCert: "",
    licenses: { cidb: false, mof: false, ePerolehan: false, cidbGrade: "", cidbSubHeads: "", other: "" },
  },
  sectionC: {
    sector: "PRIVATE SECTOR",
    serviceTypes: "",
    orgName: "",
    address: "",
    positionDept: "",
    highestAcademic: "",
    skillsCert: "",
    otherQualification: "",
  },
  sectionD: {
    contacts: [
      { fullName: "", icNumber: "", relationship: "", profession: "", address: "", hp: "", homePhone: "", email: "", hometown: "", district: "", division: "" },
      { fullName: "", icNumber: "", relationship: "", profession: "", address: "", hp: "", homePhone: "", email: "", hometown: "", district: "", division: "" },
    ],
  },
  sectionE: {
    proposerName: "",
    proposerSignature: "",
    proposerDate: "",
    seconderName: "",
    seconderSignature: "",
    seconderDate: "",
  },
  declarationAgreed: false,
};

export default function ContactPage() {
  const [reg, setReg] = useState<RegistrationData>(initialReg);
  const [inquiry, setInquiry] = useState<InquiryData>({ name: "", email: "", message: "" });
  const [isRegOpen, setRegOpen] = useState(false);

  // receipt upload (PDF)
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptErr, setReceiptErr] = useState<string | null>(null);

  // short setters
  const setField = <K extends keyof RegistrationData>(k: K, v: RegistrationData[K]) => setReg((r) => ({ ...r, [k]: v }));
  const setA = <K extends keyof SectionA>(k: K, v: SectionA[K]) => setReg((r) => ({ ...r, sectionA: { ...r.sectionA, [k]: v } }));
  const setB = <K extends keyof SectionB>(k: K, v: SectionB[K]) => setReg((r) => ({ ...r, sectionB: { ...r.sectionB, [k]: v } }));
  const setBL = <K extends keyof SectionB["licenses"]>(k: K, v: SectionB["licenses"][K]) =>
    setReg((r) => ({ ...r, sectionB: { ...r.sectionB, licenses: { ...r.sectionB.licenses, [k]: v } } }));
  const setC = <K extends keyof SectionC>(k: K, v: SectionC[K]) => setReg((r) => ({ ...r, sectionC: { ...r.sectionC, [k]: v } }));
  const setD = (idx: 0 | 1, k: keyof ContactEntry, v: string) =>
    setReg((r) => {
      const next = [...r.sectionD.contacts] as [ContactEntry, ContactEntry];
      next[idx] = { ...next[idx], [k]: v };
      return { ...r, sectionD: { contacts: next } };
    });
  const setE = <K extends keyof SectionE>(k: K, v: SectionE[K]) => setReg((r) => ({ ...r, sectionE: { ...r.sectionE, [k]: v } }));

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInquiry((i) => ({ ...i, [e.target.name]: e.target.value }));

  // upload receipt PDF to /api/uploads/receipt, store public URL
  async function handleReceiptPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptErr(null);
    if (file.type !== "application/pdf") {
      setReceiptErr("Only PDF allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReceiptErr("Max 10MB.");
      return;
    }
    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/uploads/receipt", { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      const { url } = await r.json();
      setReceiptUrl(url);
    } catch (err: any) {
      setReceiptErr(err?.message || "Upload failed");
    } finally {
      setUploadingReceipt(false);
    }
  }

  /** Submit — keep DB the same. Persist full form under licenses.__fullForm, and stash receipt in otherRegistrations as a tagged line. */
  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.declarationAgreed) {
      alert("Agree to the declaration.");
      return;
    }

    const isOwner = reg.isBusinessOwner;
    const companyName =
      (isOwner ? reg.sectionB.orgName : reg.sectionC.orgName) || reg.sectionA.applicantName || "Applicant";
    const companyNumber = isOwner ? reg.sectionB.businessRegNo || undefined : undefined;
    const registeredAddress = isOwner ? reg.sectionB.businessAddress || undefined : reg.sectionC.address || undefined;
    const correspondenceAddress = reg.sectionA.postalAddress || undefined;
    const email = reg.sectionA.contactEmail || undefined;
    const phone = reg.sectionA.contactHP || reg.sectionA.contactOffice || undefined;

    const licenses = {
      cidb: !!reg.sectionB.licenses.cidb,
      cidbGrade: reg.sectionB.licenses.cidbGrade || undefined,
      cidbSubHeads: reg.sectionB.licenses.cidbSubHeads || undefined,
      mof: !!reg.sectionB.licenses.mof,
      ePerolehan: !!reg.sectionB.licenses.ePerolehan,
      other: reg.sectionB.licenses.other || undefined,
      __fullForm: reg,
    };

    const otherRegistrations: string[] = [];
    if (receiptUrl) otherRegistrations.push(`RECEIPT:${receiptUrl}`);

    const payload = {
      companyName,
      companyNumber,
      registrationDate: undefined,
      registeredAddress,
      correspondenceAddress,
      website: undefined,
      email,
      phone,
      fax: undefined,
      authorisedCapital: undefined,
      paidUpCapital: undefined,
      dayakEquity: undefined,
      contactPersonName: reg.sectionA.applicantName || undefined,
      contactPersonDesignation: isOwner ? "Owner" : reg.sectionC.positionDept || undefined,
      contactPersonPhone: phone,
      directors: [],
      licenses,
      otherRegistrations,
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to register");
      }
      await res.json();
      alert("Registration submitted.");
      setReg(initialReg);
      setReceiptUrl("");
      setRegOpen(false);
    } catch (error: any) {
      alert(error?.message || "Registration failed.");
    }
  };

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thanks, ${inquiry.name}. We’ll be in touch.`);
    setInquiry({ name: "", email: "", message: "" });
  };

  return (
    <section className="py-16 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-12">Get in Touch</h1>

      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* CTA */}
        <section className="bg-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          <div className="w-full md:w-1/3 h-48 relative">
            <Image src="/dcci.png" alt="Join DCCI" fill className="object-cover rounded-lg" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">Member Registration</h2>
            <p className="mb-4 text-gray-600">Ready to join DCCI? Click below to register as our member.</p>
            <button onClick={() => setRegOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Register as Member
            </button>
          </div>
        </section>

        {/* Inquiry + Contact */}
        <section className="grid gap-12 lg:grid-cols-2">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">General Inquiry</h2>
            <form onSubmit={submitInquiry} className="space-y-4">
              <input name="name" type="text" placeholder="Your Name" value={inquiry.name} onChange={handleInquiryChange} required className="w-full border rounded px-3 py-2" />
              <input name="email" type="email" placeholder="Your Email" value={inquiry.email} onChange={handleInquiryChange} required className="w-full border rounded px-3 py-2" />
              <textarea name="message" placeholder="How can we help you?" value={inquiry.message} onChange={handleInquiryChange} required rows={4} className="w-full border rounded px-3 py-2" />
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Send Message</button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="mb-2"><strong>Address:</strong> Panggau Dayak Tower B, Jalan Ong Tiang Swee, Taman Liong Seng, 93200 Kuching, Sarawak</p>
              <p className="mb-2"><strong>Phone:</strong> +60 82-123456</p>
              <p className="mb-2"><strong>Email:</strong> dcci.secretariat@gmail.com</p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe title="DCCI Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8168243.048255992!2d100.590624525!3d1.527820900000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31fba7a06d1fb56d%3A0x17607ecc16badfb4!2sDayak%20Chamber%20of%20Commerce%20and%20Industry!5e0!3m2!1sen!2smy!4v1751525686991!5m2!1sen!2smy" width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" />
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      {isRegOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white p-8 rounded-2xl shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-auto">
            <button onClick={() => setRegOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>

            <h3 className="text-xl font-semibold mb-4">Membership Application Form</h3>

            {/* Owner toggle */}
            <div className="mb-6 flex gap-4 items-center">
              <span className="font-medium">Applicant Type:</span>
              <label className="inline-flex items-center gap-2">
                <input type="radio" checked={reg.isBusinessOwner} onChange={() => setField("isBusinessOwner", true)} />
                <span>Business Owner</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" checked={!reg.isBusinessOwner} onChange={() => setField("isBusinessOwner", false)} />
                <span>Non-owner Professional</span>
              </label>
            </div>

            <form onSubmit={submitRegistration} className="space-y-6">
              {/* SECTION A */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">SECTION A: PERSONAL DETAIL</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">Name of Applicant (as in IC)
                    <input value={reg.sectionA.applicantName} onChange={(e) => setA("applicantName", e.target.value)} className="border rounded px-2 py-1" required />
                  </label>
                  <label className="flex flex-col">Identification Card (New)
                    <input value={reg.sectionA.icNumber} onChange={(e) => setA("icNumber", e.target.value)} className="border rounded px-2 py-1" required />
                  </label>
                  <label className="flex flex-col">Date of Birth
                    <input type="date" value={reg.sectionA.dateOfBirth} onChange={(e) => setA("dateOfBirth", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Age
                    <input value={reg.sectionA.age} onChange={(e) => setA("age", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col sm:col-span-2">Permanent Residential Address
                    <textarea rows={2} value={reg.sectionA.permanentAddress} onChange={(e) => setA("permanentAddress", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col sm:col-span-2">Postal Address
                    <textarea rows={2} value={reg.sectionA.postalAddress} onChange={(e) => setA("postalAddress", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Office
                    <input value={reg.sectionA.contactOffice} onChange={(e) => setA("contactOffice", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Email Address
                    <input type="email" value={reg.sectionA.contactEmail} onChange={(e) => setA("contactEmail", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">HP
                    <input value={reg.sectionA.contactHP} onChange={(e) => setA("contactHP", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Hometown
                    <input value={reg.sectionA.hometown} onChange={(e) => setA("hometown", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">District
                    <input value={reg.sectionA.district} onChange={(e) => setA("district", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Division
                    <input value={reg.sectionA.division} onChange={(e) => setA("division", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                </div>
              </fieldset>

              {/* SECTION B */}
              {reg.isBusinessOwner && (
                <fieldset className="border p-4 rounded">
                  <legend className="font-semibold">SECTION B: BUSINESS INFORMATION</legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="mb-1">Business Set-Up</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["GROUP", "SDN BHD", "PLT", "SOLE PROPRIETOR", "OTHERS"].map((opt) => (
                          <label key={opt} className="inline-flex items-center gap-2">
                            <input type="radio" checked={reg.sectionB.businessSetup === opt} onChange={() => setB("businessSetup", opt as SectionB["businessSetup"])} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {reg.sectionB.businessSetup === "OTHERS" && (
                        <input placeholder="Please specify" value={reg.sectionB.businessSetupOther} onChange={(e) => setB("businessSetupOther", e.target.value)} className="mt-2 border rounded px-2 py-1" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="mb-1">Company Size</span>
                      <div className="grid grid-cols-2 gap-2">
                        {["LARGE", "MEDIUM", "SME", "MICRO-SME"].map((opt) => (
                          <label key={opt} className="inline-flex items-center gap-2">
                            <input type="radio" checked={reg.sectionB.companySize === opt} onChange={() => setB("companySize", opt as SectionB["companySize"])} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="flex flex-col">Main Industry
                      <input value={reg.sectionB.mainIndustry} onChange={(e) => setB("mainIndustry", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Sub-Industry
                      <input value={reg.sectionB.subIndustry} onChange={(e) => setB("subIndustry", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col sm:col-span-2">Name of Organization
                      <input value={reg.sectionB.orgName} onChange={(e) => setB("orgName", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col sm:col-span-2">Business Address
                      <textarea rows={2} value={reg.sectionB.businessAddress} onChange={(e) => setB("businessAddress", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Business Registration No.
                      <input value={reg.sectionB.businessRegNo} onChange={(e) => setB("businessRegNo", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Ownership (Name of Owner)
                      <input value={reg.sectionB.ownershipName} onChange={(e) => setB("ownershipName", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Highest Academic Qualification
                      <input value={reg.sectionB.highestAcademic} onChange={(e) => setB("highestAcademic", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Skills Certification / Qualification
                      <input value={reg.sectionB.skillsCert} onChange={(e) => setB("skillsCert", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="font-medium">License Category</span>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!reg.sectionB.licenses.cidb} onChange={(e) => setBL("cidb", e.target.checked)} />
                      <span>1. CIDB License/Certificate</span>
                    </label>
                    {reg.sectionB.licenses.cidb && (
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input placeholder="CIDB Grade" value={reg.sectionB.licenses.cidbGrade || ""} onChange={(e) => setBL("cidbGrade", e.target.value)} className="border rounded px-2 py-1" />
                        <input placeholder="CIDB Sub-Heads" value={reg.sectionB.licenses.cidbSubHeads || ""} onChange={(e) => setBL("cidbSubHeads", e.target.value)} className="border rounded px-2 py-1" />
                      </div>
                    )}
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!reg.sectionB.licenses.mof} onChange={(e) => setBL("mof", e.target.checked)} />
                      <span>2. Ministry Of Finance</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!reg.sectionB.licenses.ePerolehan} onChange={(e) => setBL("ePerolehan", e.target.checked)} />
                      <span>3. e-Perolehan</span>
                    </label>
                    <input placeholder="4. Other Relevant License" value={reg.sectionB.licenses.other || ""} onChange={(e) => setBL("other", e.target.value)} className="border rounded px-2 py-1 w-full" />
                  </div>
                </fieldset>
              )}

              {/* SECTION C */}
              {!reg.isBusinessOwner && (
                <fieldset className="border p-4 rounded">
                  <legend className="font-semibold">SECTION C: PROFESSIONAL SERVICES</legend>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex gap-4">
                      {["PUBLIC SECTOR", "PRIVATE SECTOR"].map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-2">
                          <input type="radio" checked={reg.sectionC.sector === opt} onChange={() => setC("sector", opt as SectionC["sector"])} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    <label className="flex flex-col">Types of Services
                      <input value={reg.sectionC.serviceTypes} onChange={(e) => setC("serviceTypes", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Name of Organization (formal)
                      <input value={reg.sectionC.orgName} onChange={(e) => setC("orgName", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col sm:col-span-2">Address (Business or Home)
                      <textarea rows={2} value={reg.sectionC.address} onChange={(e) => setC("address", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Position / Department
                      <input value={reg.sectionC.positionDept} onChange={(e) => setC("positionDept", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Highest Academic Qualification
                      <input value={reg.sectionC.highestAcademic} onChange={(e) => setC("highestAcademic", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col">Skills Certification / Qualification
                      <input value={reg.sectionC.skillsCert} onChange={(e) => setC("skillsCert", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                    <label className="flex flex-col sm:col-span-2">Other Qualification / Certification
                      <input value={reg.sectionC.otherQualification} onChange={(e) => setC("otherQualification", e.target.value)} className="border rounded px-2 py-1" />
                    </label>
                  </div>
                </fieldset>
              )}

              {/* SECTION D: two contacts */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">SECTION D: PERSON TO CONTACT</legend>
                {[0, 1].map((i) => {
                  const idx = i as 0 | 1;
                  return (
                    <div key={idx} className="border rounded p-3 mb-4">
                      <h4 className="font-medium mb-3">Contact {idx + 1}</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="flex flex-col">Full Name (as in IC)
                          <input value={reg.sectionD.contacts[idx].fullName} onChange={(e) => setD(idx, "fullName", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Identification Card (New)
                          <input value={reg.sectionD.contacts[idx].icNumber} onChange={(e) => setD(idx, "icNumber", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Relationship with Applicant
                          <input value={reg.sectionD.contacts[idx].relationship} onChange={(e) => setD(idx, "relationship", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Profession
                          <input value={reg.sectionD.contacts[idx].profession} onChange={(e) => setD(idx, "profession", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col sm:col-span-2">Permanent Residential Address
                          <textarea rows={2} value={reg.sectionD.contacts[idx].address} onChange={(e) => setD(idx, "address", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">HP
                          <input value={reg.sectionD.contacts[idx].hp} onChange={(e) => setD(idx, "hp", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Home
                          <input value={reg.sectionD.contacts[idx].homePhone} onChange={(e) => setD(idx, "homePhone", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Email Address
                          <input type="email" value={reg.sectionD.contacts[idx].email} onChange={(e) => setD(idx, "email", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Hometown
                          <input value={reg.sectionD.contacts[idx].hometown} onChange={(e) => setD(idx, "hometown", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">District
                          <input value={reg.sectionD.contacts[idx].district} onChange={(e) => setD(idx, "district", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                        <label className="flex flex-col">Division
                          <input value={reg.sectionD.contacts[idx].division} onChange={(e) => setD(idx, "division", e.target.value)} className="border rounded px-2 py-1" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </fieldset>

              {/* Declaration */}
              <div className="border p-4 rounded">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={reg.declarationAgreed} onChange={(e) => setField("declarationAgreed", e.target.checked)} className="mt-1" />
                  <span>Declaration: I shall fully abide by the rules and regulations of the DCCI's Constitution.</span>
                </label>
              </div>

              {/* SECTION E */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">SECTION E: PROPOSER & SECONDER</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">Name of Proposer
                    <input value={reg.sectionE.proposerName} onChange={(e) => setE("proposerName", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Proposer Signature (type name)
                    <input value={reg.sectionE.proposerSignature} onChange={(e) => setE("proposerSignature", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Proposer Date
                    <input type="date" value={reg.sectionE.proposerDate} onChange={(e) => setE("proposerDate", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Name of Seconder
                    <input value={reg.sectionE.seconderName} onChange={(e) => setE("seconderName", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Seconder Signature (type name)
                    <input value={reg.sectionE.seconderSignature} onChange={(e) => setE("seconderSignature", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                  <label className="flex flex-col">Seconder Date
                    <input type="date" value={reg.sectionE.seconderDate} onChange={(e) => setE("seconderDate", e.target.value)} className="border rounded px-2 py-1" />
                  </label>
                </div>
              </fieldset>

              {/* Payment receipt upload */}
              <fieldset className="border p-4 rounded">
                <legend className="font-semibold">Payment Receipt (PDF)</legend>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleReceiptPdf}
                    className="border rounded px-2 py-1"
                  />
                  {uploadingReceipt && <p className="text-sm text-gray-600">Uploading…</p>}
                  {receiptUrl && (
                    <p className="text-sm text-green-700 break-all">
                      Attached: <a href={receiptUrl} target="_blank" className="underline">receipt.pdf</a>
                    </p>
                  )}
                  {receiptErr && <p className="text-sm text-red-600">{receiptErr}</p>}
                </div>
              </fieldset>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

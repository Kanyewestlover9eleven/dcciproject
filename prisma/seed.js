// prisma/seed.js
const { PrismaClient, LicenseType } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const contractors = [];

  for (let i = 1; i <= 10; i++) {
    contractors.push({
      companyName: `Sample Contractor ${i}`,
      companyNumber: `SC${1000 + i}`,
      registrationDate: new Date(2020 + (i % 5), i % 12, 10).toISOString(),
      registeredAddress: `No ${i}, Jalan Sample, City ${i}`,
      correspondenceAddress: `P.O. Box ${i * 10}, City ${i}`,
      website: `https://sample${i}.my`,
      email: `hello${i}@sample${i}.my`,
      phone: `08${i}2-1000${i}`,
      fax: `08${i}2-2000${i}`,
      authorisedCapital: `${i * 100}000 MYR`,
      paidUpCapital: `${i * 50}000 MYR`,
      dayakEquity: 10 + i * 2,
      contactPersonName: `Contact Person ${i}`,
      contactPersonDesignation: i % 2 === 0 ? "Manager" : "Director",
      contactPersonPhone: `01${i}2345678`,
      status: i % 2 === 0 ? "active" : "pending",
      directors: [`Director A${i}`, `Director B${i}`],
      licenses: [
        { type: LicenseType.CIDB, gradeOrClass: "G" + (i % 7 + 1), subHeads: "General" },
        ...(i % 3 === 0
          ? [{ type: LicenseType.FFO }]
          : []),
      ],
      otherRegs: [`Reg ${i}A`, `Reg ${i}B`],
    });
  }

  for (const c of contractors) {
    await prisma.contractor.create({
      data: {
        companyName: c.companyName,
        companyNumber: c.companyNumber,
        registrationDate: new Date(c.registrationDate),
        registeredAddress: c.registeredAddress,
        correspondenceAddress: c.correspondenceAddress,
        website: c.website,
        email: c.email,
        phone: c.phone,
        fax: c.fax,
        authorisedCapital: c.authorisedCapital,
        paidUpCapital: c.paidUpCapital,
        dayakEquity: c.dayakEquity,
        contactPersonName: c.contactPersonName,
        contactPersonDesignation: c.contactPersonDesignation,
        contactPersonPhone: c.contactPersonPhone,
        status: c.status,
        directors: {
          create: c.directors.map((name) => ({ name })),
        },
        licenses: {
          create: c.licenses.map((l) => ({
            type: l.type,
            gradeOrClass: l.gradeOrClass,
            subHeads: l.subHeads,
          })),
        },
        otherRegs: {
          create: c.otherRegs.map((desc) => ({ description: desc })),
        },
      },
    });
  }

  console.log("✅ Seeded 10 contractors");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "seed-user" },
    update: {},
    create: {
      id: "seed-user",
      name: "Demo User",
    },
  });

  const accounts = await Promise.all([
    prisma.account.upsert({
      where: { id: "account-cma" },
      update: {},
      create: {
        id: "account-cma",
        userId: user.id,
        name: "CMA",
        accountType: "CMA",
      },
    }),
    prisma.account.upsert({
      where: { id: "account-irp" },
      update: {},
      create: {
        id: "account-irp",
        userId: user.id,
        name: "IRP",
        accountType: "IRP",
      },
    }),
    prisma.account.upsert({
      where: { id: "account-pension-savings" },
      update: {},
      create: {
        id: "account-pension-savings",
        userId: user.id,
        name: "Pension Savings",
        accountType: "PENSION_SAVINGS",
      },
    }),
  ]);

  await prisma.assetSnapshot.deleteMany({
    where: { userId: user.id },
  });

  await prisma.assetSnapshot.createMany({
    data: [
      {
        id: "snapshot-2026-01-1",
        userId: user.id,
        accountId: accounts[0].id,
        snapshotMonth: "2026-01",
        market: "KR",
        assetCategory: "ETF",
        assetName: "KODEX 200",
        currency: "KRW",
        amount: 1400000,
        returnRate: 3.1,
        memo: "January KR allocation",
      },
      {
        id: "snapshot-2026-01-2",
        userId: user.id,
        accountId: accounts[1].id,
        snapshotMonth: "2026-01",
        market: "US",
        assetCategory: "ETF",
        assetName: "VTI",
        currency: "USD",
        amount: 3900,
        returnRate: 5.8,
        memo: "January US broad market",
      },
      {
        id: "snapshot-2026-02-1",
        userId: user.id,
        accountId: accounts[0].id,
        snapshotMonth: "2026-02",
        market: "KR",
        assetCategory: "ETF",
        assetName: "KODEX 200",
        currency: "KRW",
        amount: 1500000,
        returnRate: 4.25,
        memo: "Core KR allocation",
      },
      {
        id: "snapshot-2026-02-2",
        userId: user.id,
        accountId: accounts[1].id,
        snapshotMonth: "2026-02",
        market: "US",
        assetCategory: "ETF",
        assetName: "VTI",
        currency: "USD",
        amount: 4200,
        returnRate: 7.1,
        memo: "US broad market",
      },
      {
        id: "snapshot-2026-02-3",
        userId: user.id,
        accountId: accounts[2].id,
        snapshotMonth: "2026-02",
        market: "KR",
        assetCategory: "TDF",
        assetName: "2050 TDF",
        currency: "KRW",
        amount: 800000,
        returnRate: 2.45,
        memo: "Pension allocation",
      },
      {
        id: "snapshot-2026-03-1",
        userId: user.id,
        accountId: accounts[0].id,
        snapshotMonth: "2026-03",
        market: "KR",
        assetCategory: "BOND",
        assetName: "Korea Bond",
        currency: "KRW",
        amount: 600000,
        returnRate: 1.2,
        memo: "Bond rebalance",
      },
      {
        id: "snapshot-2026-03-2",
        userId: user.id,
        accountId: accounts[1].id,
        snapshotMonth: "2026-03",
        market: "US",
        assetCategory: "ETF",
        assetName: "VTI",
        currency: "USD",
        amount: 5100,
        returnRate: 8.4,
        memo: "March US broad market",
      },
      {
        id: "snapshot-2026-03-3",
        userId: user.id,
        accountId: accounts[2].id,
        snapshotMonth: "2026-03",
        market: "KR",
        assetCategory: "TDF",
        assetName: "2050 TDF",
        currency: "KRW",
        amount: 820000,
        returnRate: 2.9,
        memo: "Pension allocation update",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "../src/shared/prisma.client"

export const cleanDb = async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `
  const tableNames = tables.map(({ tablename }) => `${tablename}`).join(", ")
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE`)
}
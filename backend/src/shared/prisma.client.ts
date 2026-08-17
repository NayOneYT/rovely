import { appConfig } from "./app.config.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"

const adapter = new PrismaPg({ connectionString: appConfig.databaseUrl })
const prisma = new PrismaClient({ adapter })

export { prisma }
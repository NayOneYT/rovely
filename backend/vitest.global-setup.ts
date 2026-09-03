import dotenv from "dotenv"
import { execSync } from "child_process"

export const setup = () => {
  dotenv.config({ path: ".env.test", override: true })
  execSync("docker compose -f ../compose.test.yaml up -d", { stdio: "inherit" })
  execSync("npx prisma migrate deploy", { env: process.env, stdio: "inherit" })
}

export const teardown = () => {
  execSync("docker compose -f ../compose.test.yaml down", { stdio: "inherit" })
}
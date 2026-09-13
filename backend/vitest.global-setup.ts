import dotenv from "dotenv"
import { execSync } from "child_process"

export const setup = () => {
  dotenv.config({ path: ".env.test", quiet: true })
  execSync("docker compose -f ./compose.test.yaml up -d", { stdio: "ignore" })
  execSync("npx prisma migrate deploy", { env: process.env, stdio: "ignore" })
}

export const teardown = () => {
  execSync("docker compose -f ./compose.test.yaml down", { stdio: "ignore" })
}
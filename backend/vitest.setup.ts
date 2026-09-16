import { afterAll } from "vitest"
import { redis } from "./src/shared/redis.client"

afterAll(async () => await redis.quit())
import { beforeEach } from "vitest"
import { cleanDb } from "./tests/clean-db"
import { redis } from "./src/shared/redis.client"

beforeEach(async () => await Promise.all([
  cleanDb(),
  redis.flushdb()
]))
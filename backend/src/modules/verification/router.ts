import { Router } from "express"
import emailRouter from "./email/router.js"
import phoneRouter from "./phone/router.js"

const router = Router()

router.use("/email", emailRouter)
router.use("/phone", phoneRouter)

export default router
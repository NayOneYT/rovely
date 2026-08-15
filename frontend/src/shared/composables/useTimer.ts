import { type Ref, ref, onUnmounted } from "vue"
import { formatMsToMMSS } from "../utils"

export const useTimer = (cooldowns: Ref<Record<string, number>>) => {
  const timersMs = ref<Record<string, number>>({})
  const intervals: Record<string, number> = {}

  const startTimer = (key: string, timeLeftMs: number) => {
    if (intervals[key]) clearInterval(intervals[key])

    timersMs.value[key] = timeLeftMs

    intervals[key] = setInterval(() => {
      const remainingMs = cooldowns.value[key]! - Date.now()
      if (remainingMs > 0) timersMs.value[key] = remainingMs
      else {
        clearInterval(intervals[key])
        delete cooldowns.value[key]
        delete intervals[key]
        delete timersMs.value[key]
      }
    }, 1000)
  }

  const createNewTimer = (key: string, timeLeftMs: number) => {
    cooldowns.value[key] = Date.now() + timeLeftMs
    startTimer(key, timeLeftMs)
  }

  const formattedTime = (key: string | undefined) => {
    if (!key) return
    const totalMs = timersMs.value[key]
    if (totalMs === undefined) return
    return formatMsToMMSS(totalMs)
  }

  let now
  Object.entries(cooldowns.value).forEach(([phone, sendCooldownUntilMs]) => {
    now = Date.now()
    if (sendCooldownUntilMs <= now) delete cooldowns.value[phone]
    else startTimer(phone, sendCooldownUntilMs - now)
  })

  onUnmounted(() => {
    Object.values(intervals).forEach(interval => clearInterval(interval))
    Object.keys(intervals).forEach(key => delete intervals[key])
  })

  return { createNewTimer, formattedTime }
}
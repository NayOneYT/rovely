import { type Ref, ref, onUnmounted } from "vue"

export const useTimer = (cooldowns: Ref<Record<string, number>>) => {
  const timersSec = ref<Record<string, number>>({})
  const intervals: Record<string, number> = {}

  const startTimer = (key: string, timeLeftMs: number) => {
    if (intervals[key]) clearInterval(intervals[key])

    timersSec.value[key] = Math.floor(timeLeftMs / 1000)

    intervals[key] = setInterval(() => {
      if (timersSec.value[key]! > 0) timersSec.value[key]!--
      else {
        clearInterval(intervals[key])
        delete cooldowns.value[key]
        delete intervals[key]
        delete timersSec.value[key]
      }
    }, 1000)
  }

  const createNewTimer = (key: string, timeLeftMs: number) => {
    cooldowns.value[key] = Date.now() + timeLeftMs
    startTimer(key, timeLeftMs)
  }

  const formattedTime = (key: string | undefined) => {
    if (!key) return
    const totalSeconds = timersSec.value[key]
    if (totalSeconds === undefined) return
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
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
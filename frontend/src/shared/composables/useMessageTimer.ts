import { ref } from "vue"

export const useMessageTimer = () => {
  const timers = ref<Record<string, number>>({})
  const intervals: Record<string, number> = {}

  const startTimer = (phone: string, timeLeftMs: number) => {
    if (intervals[phone]) clearInterval(intervals[phone])

    const timeLeftSec = Math.floor(timeLeftMs / 1000)
    timers.value[phone] = timeLeftSec

    intervals[phone] = setInterval(() => {
      if (timers.value[phone]! > 0) timers.value[phone]!--
      else {
        clearInterval(intervals[phone])
        delete intervals[phone]
        delete timers.value[phone]
      }
    }, 1000)
  }

  const formattedTime = (phone: string | undefined) => {
    if (!phone) return undefined
    const totalSeconds = timers.value[phone] || null
    if (!totalSeconds) return
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const clearAllTimers = () => {
    Object.values(intervals).forEach(interval => {
      clearInterval(interval)
    })
    Object.keys(intervals).forEach(key => {
      delete intervals[key]
    })
    timers.value = {}
  }

  return { startTimer, formattedTime, clearAllTimers }
}
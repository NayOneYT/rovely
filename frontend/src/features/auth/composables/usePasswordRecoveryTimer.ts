import { ref } from "vue"

export const usePasswordRecoveryTimer = () => {
  const timers = ref<Record<string, number>>({})
  const intervals: Record<string, number> = {}

  const startTimer = (to: "EMAIL" | "PHONE", contact: string, timeLeftMs: number) => {
    const formattedContact = `${to}-${contact}`
    if (intervals[formattedContact]) clearInterval(intervals[formattedContact])

    const timeLeftSec = Math.floor(timeLeftMs / 1000)
    timers.value[formattedContact] = timeLeftSec

    intervals[formattedContact] = setInterval(() => {
      if (timers.value[formattedContact]! > 0) timers.value[formattedContact]!--
      else {
        clearInterval(intervals[formattedContact])
        delete intervals[formattedContact]
        delete timers.value[formattedContact]
      }
    }, 1000)
  }

  const formattedTime = (to: "EMAIL" | "PHONE", contact: string | undefined) => {
    if (!contact) return undefined
    const formattedContact = `${to}-${contact}`
    const totalSeconds = timers.value[formattedContact]
    if (totalSeconds === undefined) return
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
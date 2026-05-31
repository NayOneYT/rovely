import { ref } from "vue"

export default () => {
  const timers = ref<Record<string, number>>({})
  const intervals: Record<string, number> = {}

  const startTimer = (email: string, seconds: number) => {
    if (intervals[email]) clearInterval(intervals[email])

    timers.value[email] = seconds

    intervals[email] = setInterval(() => {
      if (timers.value[email]! > 0) timers.value[email]!--
      else {
        clearInterval(intervals[email])
        delete intervals[email]
        delete timers.value[email]
      }
    }, 1000)
  }

  const formattedTime = (email: string) => {
    const totalSeconds = timers.value[email] || null
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
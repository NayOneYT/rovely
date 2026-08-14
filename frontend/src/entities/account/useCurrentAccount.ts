import { queryOptions } from "@tanstack/vue-query"
import { useQuery } from "@tanstack/vue-query"
import { accountApi } from "./api"
import { config } from "@/shared/config"

export const currentAccountQueryOptions = queryOptions({
  queryKey: ["account", "me"],
  queryFn: async () => {
    try {
      const response = await accountApi.me()
      return response
    } catch {
      return null
    }
  },
  staleTime: config.account.meStaleTimeMs
})

export const useCurrentAccount = () => useQuery(currentAccountQueryOptions)
import { api } from "./api";
import type { Lookups } from "@/features/events/events.types";

export const lookupApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLookups: build.query<Lookups, void>({
      query: () => "lookups",
      keepUnusedDataFor: 86_400,
    }),
  }),
});

export const { useGetLookupsQuery } = lookupApi;
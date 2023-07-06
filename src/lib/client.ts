import { QueryClient } from "@tanstack/react-query";

// Time in Ms
const Sec = 1000;
const Min = Sec * 60;

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * Min,
      retry: false,
    },
  },
});

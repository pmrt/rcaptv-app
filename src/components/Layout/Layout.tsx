import { Outlet } from "react-router-dom";

import { client } from "@/lib/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navbar from "../Navbar";

export default function Layout() {
  return (
    <QueryClientProvider client={client}>
      <Navbar />
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

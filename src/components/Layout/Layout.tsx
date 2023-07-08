import { Outlet } from "react-router-dom";

import { client } from "@/lib/client";
import { QueryClientProvider } from "@tanstack/react-query";
import Navbar from "../Navbar";

import store from "@/store";
import { Provider as ReduxProvider } from "react-redux";
import "./Layout.scss";

export default function Layout() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={client}>
        <Navbar />
        <Outlet />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ReduxProvider>
  );
}

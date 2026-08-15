"use client";

import { Header } from "./header";

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

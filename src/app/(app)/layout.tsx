"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!document.cookie.includes("tiktok_connected=true")) {
      router.replace("/");
    }
  }, [router]);

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </>
  );
}

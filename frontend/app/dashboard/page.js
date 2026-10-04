"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardGateway() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken || !userStr) {
        // Not logged in
        router.push("/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          // Dynamic redirect based on role
          switch (user.role) {
            case "player":
              router.push("/player");
              break;
            case "scout":
              router.push("/scout");
              break;
            case "coach":
              router.push("/coach");
              break;
            case "admin":
              router.push("/admin");
              break;
            default:
              router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-zinc-400 uppercase tracking-widest text-sm font-bold">
        Setting Up Pitch...
      </p>
    </div>
  );
}

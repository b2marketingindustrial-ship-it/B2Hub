import { useState } from "react";
import type { User } from "../src/types/typeUser";

export default function useUser() {
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const data = localStorage.getItem("user");
      return data
        ? JSON.parse(data)
        : {
            id: "guest",
            name: "Usuário",
            role: "guest",
            email: "",
          };
    } catch {
      return null;
    }
  });

  return user;
}

import { useEffect, useState } from "react";
import { normalizeRole } from "../src/lib/roles";
import type { User } from "../src/types/typeUser";

const guestUser: User = {
  id: "guest",
  name: "Usuário",
  role: "guest",
  email: "",
};

function getStoredUser(): User {
  try {
    const data = localStorage.getItem("user");

    if (data) {
      const parsedUser = JSON.parse(data);
      return {
        ...parsedUser,
        role: normalizeRole(parsedUser.role),
      };
    }

    return guestUser;
  } catch {
    return guestUser;
  }
}

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUser(getStoredUser());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return user;
}

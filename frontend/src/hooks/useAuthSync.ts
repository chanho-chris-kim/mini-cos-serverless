import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../api/auth";
import { useUserStore } from "../lib/store";

export function useAuthSync() {
  const token = useUserStore(s => s.token);
  const setUser = useUserStore(s => s.setUser);
  const clearUser = useUserStore(s => s.clearUser);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function sync() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (user) setUser(user, token);
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    sync();
  }, [token]);

  return { loading };
}

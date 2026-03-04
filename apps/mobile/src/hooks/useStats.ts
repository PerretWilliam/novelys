import type { Stats } from "@readingos/shared";
import { useEffect, useState } from "react";
import { useApiClient } from "./useApiClient";

export const useStats = () => {
  const api = useApiClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getStats();
        if (mounted) {
          setStats(response);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Impossible de charger les statistiques");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [api]);

  return { stats, isLoading, error };
};

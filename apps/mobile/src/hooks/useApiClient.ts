import { useMemo } from "react";
import { useApiConfig } from "../contexts/ApiConfigContext";
import { buildApiClient } from "../lib/api-client";

export const useApiClient = () => {
  const { apiBaseUrl } = useApiConfig();
  return useMemo(() => buildApiClient(apiBaseUrl), [apiBaseUrl]);
};

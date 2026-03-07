import { useMemo } from "react";
import { useApiConfig } from "../contexts/ApiConfigContext";
import { buildApiClient } from "../lib/api-client";

export const useApiClient = () => {
  const { apiBaseUrl, apiToken } = useApiConfig();
  return useMemo(() => buildApiClient(apiBaseUrl, apiToken), [apiBaseUrl, apiToken]);
};

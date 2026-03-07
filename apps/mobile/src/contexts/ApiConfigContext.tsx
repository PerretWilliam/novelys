import { createContext, useContext } from "react";
import { Platform } from "react-native";

type ApiConfig = {
  apiBaseUrl: string;
  apiToken: string;
};

const resolveApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }
  return "http://localhost:4000";
};

const resolveApiToken = (): string => {
  return process.env.EXPO_PUBLIC_API_TOKEN?.trim() ?? "";
};

const ApiConfigContext = createContext<ApiConfig>({
  apiBaseUrl: resolveApiBaseUrl(),
  apiToken: resolveApiToken(),
});

export const ApiConfigProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApiConfigContext.Provider value={{ apiBaseUrl: resolveApiBaseUrl(), apiToken: resolveApiToken() }}>
      {children}
    </ApiConfigContext.Provider>
  );
};

export const useApiConfig = () => useContext(ApiConfigContext);

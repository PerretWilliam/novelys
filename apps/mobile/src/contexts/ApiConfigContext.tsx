import { createContext, useContext } from "react";
import { Platform } from "react-native";

type ApiConfig = {
  apiBaseUrl: string;
};

const resolveApiBaseUrl = (): string => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }
  return "http://localhost:4000";
};

const ApiConfigContext = createContext<ApiConfig>({
  apiBaseUrl: resolveApiBaseUrl(),
});

export const ApiConfigProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApiConfigContext.Provider value={{ apiBaseUrl: resolveApiBaseUrl() }}>{children}</ApiConfigContext.Provider>;
};

export const useApiConfig = () => useContext(ApiConfigContext);

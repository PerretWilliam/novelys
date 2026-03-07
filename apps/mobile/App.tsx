import { AppRoot } from "./src/root/AppRoot";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

const SAFE_AREA_DEPRECATION = "SafeAreaView has been deprecated and will be removed in a future release.";
type WarnGuard = typeof globalThis & {
  __readingOsSafeAreaWarnFiltered?: boolean;
};

if (__DEV__) {
  const guard = globalThis as WarnGuard;
  if (!guard.__readingOsSafeAreaWarnFiltered) {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const [first] = args;
      if (typeof first === "string" && first.includes(SAFE_AREA_DEPRECATION)) {
        return;
      }
      originalWarn(...args);
    };
    guard.__readingOsSafeAreaWarnFiltered = true;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}

import { View } from "react-native";
import { ApiConfigProvider } from "../contexts/ApiConfigContext";
import { LibraryProvider } from "../contexts/LibraryContext";
import { PreferencesProvider } from "../contexts/PreferencesContext";
import { RecentSearchesProvider } from "../contexts/RecentSearchesContext";
import { ReadingListsProvider } from "../contexts/ReadingListsContext";
import { ToastProvider } from "../contexts/ToastContext";
import { RootNavigator } from "../navigation/RootNavigator";

export const AppRoot = () => {
  return (
    <ApiConfigProvider>
      <PreferencesProvider>
        <RecentSearchesProvider>
          <LibraryProvider>
            <ReadingListsProvider>
              <ToastProvider>
                <View className="flex-1 bg-brand-50 dark:bg-slate-950">
                  <RootNavigator />
                </View>
              </ToastProvider>
            </ReadingListsProvider>
          </LibraryProvider>
        </RecentSearchesProvider>
      </PreferencesProvider>
    </ApiConfigProvider>
  );
};

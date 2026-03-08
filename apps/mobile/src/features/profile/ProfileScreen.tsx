import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BookLoader } from "../../components/BookLoader";
import { useLibrary } from "../../contexts/LibraryContext";
import { usePreferences } from "../../contexts/PreferencesContext";
import { StateText } from "../../components/StateText";
import { useStats } from "../../hooks/useStats";
import { statusLabel, orderedStatuses } from "../../lib/status";
import { cardSurfaceClass, cardInsetClass } from "../../lib/ui";
import { appColors } from "../../theme/colors";

export const ProfileScreen = () => {
  const { items } = useLibrary();
  const {
    searchLang,
    setSearchLang,
    themeMode,
    setThemeMode,
    error,
  } = usePreferences();
  const { stats, isLoading: isStatsLoading, error: statsError } = useStats();
  const total = items.length;

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="person-circle" size={22} color={appColors.primaryText} />
        <Text className="text-xl font-black text-text dark:text-text-dark">Profil</Text>
      </View>

      <View className={`rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <Text className="text-sm text-muted dark:text-text-soft-dark">Lecteur</Text>
        <Text className="mt-1 text-2xl font-black text-text dark:text-text-dark">Mon profil lecture</Text>
        <Text className="mt-1 text-sm text-muted dark:text-text-soft-dark">Total de livres suivis: {total}</Text>
      </View>

      <View className={`mt-3 rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="stats-chart" size={18} color={appColors.primaryText} />
          <Text className="text-sm font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">Répartition et statistiques</Text>
        </View>

        {isStatsLoading ? <BookLoader label="Calcul des statistiques" /> : null}
        {statsError ? <StateText message={statsError} kind="error" /> : null}

        <Text className="mb-2 mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-text-soft-dark">Répartition</Text>
        {orderedStatuses.map((status) => {
          const count = items.filter((item) => item.status === status).length;
          return (
            <View key={status} className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-text-soft dark:text-text-soft-dark">{statusLabel[status]}</Text>
              <Text className="text-sm font-black text-text dark:text-text-dark">{count}</Text>
            </View>
          );
        })}

        {stats ? (
          <View className="mt-2 flex-row flex-wrap justify-between">
            <MiniStat label="Note moyenne" value={stats.averageRating.toFixed(2)} />
            <MiniStat label="Pages lues" value={String(stats.pagesRead)} />
          </View>
        ) : null}
      </View>

      <View className={`mt-3 rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="settings" size={18} color={appColors.primaryText} />
          <Text className="text-sm font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">Paramètres</Text>
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">
          Langue de recherche
        </Text>
        <View className="mb-3 flex-row gap-2">
          <Pressable
            className={`rounded-full px-3 py-2 ${searchLang === "fr" ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"}`}
            onPress={() => setSearchLang("fr")}
          >
            <Text className={`text-xs font-black ${searchLang === "fr" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              Français
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${searchLang === "en" ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"}`}
            onPress={() => setSearchLang("en")}
          >
            <Text className={`text-xs font-black ${searchLang === "en" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              Anglais
            </Text>
          </Pressable>
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">Thème</Text>
        <View className="mb-3 flex-row gap-2">
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "system" ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"}`}
            onPress={() => setThemeMode("system")}
          >
            <Text className={`text-xs font-black ${themeMode === "system" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              Système
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "light" ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"}`}
            onPress={() => setThemeMode("light")}
          >
            <Text className={`text-xs font-black ${themeMode === "light" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              Clair
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "dark" ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"}`}
            onPress={() => setThemeMode("dark")}
          >
            <Text className={`text-xs font-black ${themeMode === "dark" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              Sombre
            </Text>
          </Pressable>
        </View>

      </View>

      {error ? <StateText message={error} kind="error" /> : null}
    </ScrollView>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <View className={`mb-2 w-[48%] rounded-xl px-3 py-2 ${cardInsetClass}`}>
    <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-text-soft-dark">{label}</Text>
    <Text className="text-lg font-black text-text dark:text-text-dark">{value}</Text>
  </View>
);

import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLibrary } from "../../contexts/LibraryContext";
import { usePreferences } from "../../contexts/PreferencesContext";
import { StateText } from "../../components/StateText";
import { useStats } from "../../hooks/useStats";
import { statusLabel, orderedStatuses } from "../../lib/status";
import { cardSurfaceClass, cardInsetClass } from "../../lib/ui";

export const ProfileScreen = () => {
  const { items } = useLibrary();
  const {
    searchLang,
    setSearchLang,
    themeMode,
    setThemeMode,
    showCovers,
    setShowCovers,
    compactMode,
    setCompactMode,
    error,
  } = usePreferences();
  const { stats, isLoading: isStatsLoading, error: statsError } = useStats();
  const total = items.length;

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="person-circle" size={22} color="#0F4C81" />
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100">
          Profil
        </Text>
      </View>

      <View className={`rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <Text className="text-sm text-slate-600 dark:text-slate-300">
          Lecteur
        </Text>
        <Text className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
          Mon profil lecture
        </Text>
        <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Total de livres suivis: {total}
        </Text>
      </View>

      <View className={`mt-3 rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="stats-chart" size={18} color="#0F4C81" />
          <Text className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
            Répartition et statistiques
          </Text>
        </View>

        {isStatsLoading ? <StateText message="Chargement..." /> : null}
        {statsError ? <StateText message={statsError} kind="error" /> : null}

        <Text className="mb-2 mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          Répartition
        </Text>
        {orderedStatuses.map((status) => {
          const count = items.filter((item) => item.status === status).length;
          return (
            <View
              key={status}
              className="mb-2 flex-row items-center justify-between"
            >
              <Text className="text-sm text-slate-700 dark:text-slate-300">
                {statusLabel[status]}
              </Text>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                {count}
              </Text>
            </View>
          );
        })}

        {stats ? (
          <View className="mt-2 flex-row flex-wrap justify-between">
            <MiniStat
              label="Note moyenne"
              value={stats.averageRating.toFixed(2)}
            />
            <MiniStat label="Pages lues" value={String(stats.pagesRead)} />
          </View>
        ) : null}
      </View>

      <View className={`mt-3 rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="settings" size={18} color="#0F4C81" />
          <Text className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
            Paramètres
          </Text>
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          Langue de recherche
        </Text>
        <View className="mb-3 flex-row gap-2">
          <Pressable
            className={`rounded-full px-3 py-2 ${searchLang === "fr" ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"}`}
            onPress={() => setSearchLang("fr")}
          >
            <Text
              className={`text-xs font-black ${searchLang === "fr" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
            >
              Français
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${searchLang === "en" ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"}`}
            onPress={() => setSearchLang("en")}
          >
            <Text
              className={`text-xs font-black ${searchLang === "en" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
            >
              Anglais
            </Text>
          </Pressable>
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          Thème
        </Text>
        <View className="mb-3 flex-row gap-2">
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "system" ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"}`}
            onPress={() => setThemeMode("system")}
          >
            <Text
              className={`text-xs font-black ${themeMode === "system" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
            >
              Système
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "light" ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"}`}
            onPress={() => setThemeMode("light")}
          >
            <Text
              className={`text-xs font-black ${themeMode === "light" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
            >
              Clair
            </Text>
          </Pressable>
          <Pressable
            className={`rounded-full px-3 py-2 ${themeMode === "dark" ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"}`}
            onPress={() => setThemeMode("dark")}
          >
            <Text
              className={`text-xs font-black ${themeMode === "dark" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
            >
              Sombre
            </Text>
          </Pressable>
        </View>

        <ToggleRow
          title="Afficher les couvertures"
          active={showCovers}
          onToggle={() => setShowCovers(!showCovers)}
        />
        <ToggleRow
          title="Mode compact"
          active={compactMode}
          onToggle={() => setCompactMode(!compactMode)}
        />
      </View>

      {error ? <StateText message={error} kind="error" /> : null}
    </ScrollView>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <View className={`mb-2 w-[48%] rounded-xl px-3 py-2 ${cardInsetClass}`}>
    <Text className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
      {label}
    </Text>
    <Text className="text-lg font-black text-slate-900 dark:text-slate-100">
      {value}
    </Text>
  </View>
);

const ToggleRow = ({
  title,
  active,
  onToggle,
}: {
  title: string;
  active: boolean;
  onToggle: () => void;
}) => (
  <View className="mb-2 flex-row items-center justify-between">
    <Text className="text-sm text-slate-700 dark:text-slate-300">{title}</Text>
    <Pressable
      className={`rounded-full px-3 py-1 ${active ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"}`}
      onPress={onToggle}
    >
      <Text className="text-xs font-black text-white">
        {active ? "ACTIVÉ" : "DÉSACTIVÉ"}
      </Text>
    </Pressable>
  </View>
);

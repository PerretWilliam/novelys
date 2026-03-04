import type { LibraryStatus } from "@readingos/shared";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { BookListItem } from "../../components/BookListItem";
import { StateText } from "../../components/StateText";
import { useLibrary } from "../../contexts/LibraryContext";
import { statusLabel } from "../../lib/status";
import { cardInsetClass } from "../../lib/ui";
import type {
  MainTabParamList,
  RootStackParamList,
} from "../../navigation/types";

type LibraryRoute = RouteProp<MainTabParamList, "LibraryTab">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const LibraryScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<LibraryRoute>();
  const defaultStatus = route.params?.status ?? "all";
  const { items, isLoading, error, refresh } = useLibrary();
  const [status, setStatus] = useState<LibraryStatus | "all">(defaultStatus);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  useEffect(() => {
    void refresh(status === "all" ? undefined : status, query || undefined);
  }, [status, query, refresh]);

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="library" size={20} color="#0F4C81" />
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100">
          Bibliothèque
        </Text>
      </View>

      <TextInput
        className={`mb-3 rounded-xl px-3 py-3 text-slate-900 dark:text-slate-100 ${cardInsetClass}`}
        value={query}
        onChangeText={setQuery}
        placeholder="Filtrer titre/auteur"
        autoCapitalize="none"
      />

      <View className="mb-3 flex-row flex-wrap gap-2">
        {(["all", "to_read", "reading", "read", "abandoned"] as const).map(
          (value) => (
            <Pressable
              key={value}
              className={`rounded-full px-3 py-2 ${status === value ? "bg-brand-700" : "bg-brand-50 dark:bg-slate-700"}`}
              onPress={() => setStatus(value)}
            >
              <Text
                className={`text-xs font-black ${status === value ? "text-white" : "text-brand-700 dark:text-brand-100"}`}
              >
                {value === "all" ? "Toutes" : statusLabel[value]}
              </Text>
            </Pressable>
          ),
        )}
      </View>

      {isLoading ? <StateText message="Chargement..." /> : null}
      {error ? <StateText message={error} kind="error" /> : null}
      {!isLoading && items.length === 0 ? (
        <StateText message="Aucun livre dans ce filtre." />
      ) : null}

      <View className="mt-1">
        {items.map((item) => (
          <BookListItem
            key={item.id}
            book={item.book}
            status={item.status}
            onPress={() =>
              navigation.navigate("LibraryItem", { itemId: item.id })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
};

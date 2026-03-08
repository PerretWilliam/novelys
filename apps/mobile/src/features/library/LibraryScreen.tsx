import type { LibraryStatus } from "@readingos/shared";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BookListItem } from "../../components/BookListItem";
import { BookLoader } from "../../components/BookLoader";
import { EmptyState } from "../../components/EmptyState";
import { StateText } from "../../components/StateText";
import { useLibrary } from "../../contexts/LibraryContext";
import { useToast } from "../../contexts/ToastContext";
import { statusLabel } from "../../lib/status";
import { cardInsetClass } from "../../lib/ui";
import { appColors } from "../../theme/colors";
import type { MainTabParamList, RootStackParamList } from "../../navigation/types";

type LibraryRoute = RouteProp<MainTabParamList, "LibraryTab">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type SortMode = "date" | "author";

const parseSortableDate = (value?: string): number => {
  if (!value) {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  if (/^\d{4}$/.test(trimmed)) {
    return Number(trimmed) * 10_000;
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const ts = Date.parse(`${trimmed}-01T00:00:00.000Z`);
    return Number.isNaN(ts) ? 0 : ts;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ts = Date.parse(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(ts) ? 0 : ts;
  }

  const fallback = Date.parse(trimmed);
  return Number.isNaN(fallback) ? 0 : fallback;
};

export const LibraryScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<LibraryRoute>();
  const defaultStatus = route.params?.status ?? "all";
  const { items, isLoading, error, refresh, updateItem } = useLibrary();
  const { showToast } = useToast();
  const [status, setStatus] = useState<LibraryStatus | "all">(defaultStatus);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  useEffect(() => {
    setStatus(defaultStatus);
  }, [defaultStatus]);

  useEffect(() => {
    void refresh(status === "all" ? undefined : status, query || undefined);
  }, [status, query, refresh]);

  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sortMode === "author") {
      next.sort((a, b) => {
        const authorA = a.book.authors[0]?.trim() ?? "";
        const authorB = b.book.authors[0]?.trim() ?? "";
        if (!authorA && !authorB) {
          return a.book.title.localeCompare(b.book.title, "fr", { sensitivity: "base" });
        }
        if (!authorA) {
          return 1;
        }
        if (!authorB) {
          return -1;
        }
        return authorA.localeCompare(authorB, "fr", { sensitivity: "base" });
      });
      return next;
    }

    next.sort((a, b) => {
      const dateA = parseSortableDate(a.book.publishedDate) || parseSortableDate(a.createdAt);
      const dateB = parseSortableDate(b.book.publishedDate) || parseSortableDate(b.createdAt);
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      return a.book.title.localeCompare(b.book.title, "fr", { sensitivity: "base" });
    });
    return next;
  }, [items, sortMode]);

  const updateStatusFromSwipe = useCallback(
    async (id: number, nextStatus: LibraryStatus) => {
      try {
        await updateItem(id, { status: nextStatus });
        showToast(nextStatus === "reading" ? "Passé en « En cours »." : "Passé en « Lus ».", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Mise à jour impossible", "error");
      }
    },
    [showToast, updateItem],
  );

  const renderLeftAction = () => (
    <View className="mb-3 w-28 items-center justify-center rounded-2xl bg-warning">
      <Ionicons name="time-outline" size={20} color={appColors.surface} />
      <Text className="mt-1 text-xs font-black text-neutral-inverse">En cours</Text>
    </View>
  );

  const renderRightAction = () => (
    <View className="mb-3 w-28 items-center justify-center rounded-2xl bg-success">
      <Ionicons name="checkmark-circle-outline" size={20} color={appColors.surface} />
      <Text className="mt-1 text-xs font-black text-neutral-inverse">Lus</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="library" size={20} color={appColors.primaryText} />
        <Text className="text-xl font-black text-text dark:text-text-dark">Bibliothèque</Text>
      </View>

      <TextInput
        className={`mb-3 rounded-xl px-3 py-3 text-text dark:text-text-dark ${cardInsetClass}`}
        value={query}
        onChangeText={setQuery}
        placeholder="Filtrer titre/auteur"
        autoCapitalize="none"
      />

      <View className="mb-3 flex-row flex-wrap gap-2">
        {(["all", "to_read", "reading", "read", "abandoned"] as const).map((value) => (
          <Pressable
            key={value}
            className={`rounded-full px-3 py-2 ${status === value ? "bg-primary" : "bg-canvas dark:bg-surface-3-dark"}`}
            onPress={() => setStatus(value)}
          >
            <Text className={`text-xs font-black ${status === value ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
              {value === "all" ? "Toutes" : statusLabel[value]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-3 flex-row gap-2">
        <Pressable
          className={`rounded-full px-3 py-2 ${sortMode === "date" ? "bg-primary" : "bg-canvas dark:bg-surface-3-dark"}`}
          onPress={() => setSortMode("date")}
        >
          <Text
            className={`text-xs font-black ${
              sortMode === "date" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"
            }`}
          >
            Date
          </Text>
        </Pressable>
        <Pressable
          className={`rounded-full px-3 py-2 ${sortMode === "author" ? "bg-primary" : "bg-canvas dark:bg-surface-3-dark"}`}
          onPress={() => setSortMode("author")}
        >
          <Text
            className={`text-xs font-black ${
              sortMode === "author" ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"
            }`}
          >
            Auteur
          </Text>
        </Pressable>
      </View>

      {isLoading ? <BookLoader label="Chargement de votre bibliothèque" /> : null}
      {error ? <StateText message={error} kind="error" /> : null}
      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon="library-outline"
          title="Bibliothèque vide"
          description="Aucun livre ne correspond à ce filtre. Modifiez vos critères ou ajoutez un nouveau livre."
        />
      ) : null}

      <View className="mt-1">
        {sortedItems.map((item) => (
          <Swipeable
            key={item.id}
            renderLeftActions={renderLeftAction}
            renderRightActions={renderRightAction}
            leftThreshold={56}
            rightThreshold={56}
            onSwipeableOpen={(direction) => {
              if (direction === "left") {
                void updateStatusFromSwipe(item.id, "reading");
                return;
              }
              void updateStatusFromSwipe(item.id, "read");
            }}
          >
            <BookListItem
              book={item.book}
              status={item.status}
              rating={item.rating}
              onPress={() => navigation.navigate("LibraryItem", { itemId: item.id })}
            />
          </Swipeable>
        ))}
      </View>
    </ScrollView>
  );
};

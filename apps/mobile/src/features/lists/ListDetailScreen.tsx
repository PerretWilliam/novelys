import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ReadingListDetails } from "@readingos/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BookListItem } from "../../components/BookListItem";
import { BookLoader } from "../../components/BookLoader";
import { EmptyState } from "../../components/EmptyState";
import { StateText } from "../../components/StateText";
import { useLibrary } from "../../contexts/LibraryContext";
import { useReadingLists } from "../../contexts/ReadingListsContext";
import { useToast } from "../../contexts/ToastContext";
import { appColors } from "../../theme/colors";
import type { RootStackParamList } from "../../navigation/types";

type ListDetailRoute = RouteProp<RootStackParamList, "ListDetail">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ListDetailScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<ListDetailRoute>();
  const { listId } = route.params;
  const { items: libraryItems, isLoading: isLibraryLoading, refresh: refreshLibrary, updateItem } = useLibrary();
  const { getList, addItem, removeItem } = useReadingLists();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<ReadingListDetails | null>(null);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await getList(listId);
      setList(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger la liste");
    } finally {
      setIsLoading(false);
    }
  }, [getList, listId]);

  useEffect(() => {
    if (libraryItems.length === 0) {
      void refreshLibrary();
    }
  }, [libraryItems.length, refreshLibrary]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useFocusEffect(
    useCallback(() => {
      void refreshLibrary();
      void loadList();
      return undefined;
    }, [loadList, refreshLibrary]),
  );

  const existingIds = useMemo(() => new Set((list?.items ?? []).map((item) => item.id)), [list?.items]);

  const candidates = useMemo(() => libraryItems.filter((item) => !existingIds.has(item.id)), [libraryItems, existingIds]);

  const onAdd = async (libraryItemId: number) => {
    try {
      await addItem(listId, libraryItemId);
      await Promise.all([loadList(), refreshLibrary()]);
      showToast("Livre ajouté à la liste.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ajout impossible", "error");
    }
  };

  const onRemove = async (libraryItemId: number) => {
    try {
      await removeItem(listId, libraryItemId);
      await Promise.all([loadList(), refreshLibrary()]);
      showToast("Livre retiré de la liste.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Suppression impossible", "error");
    }
  };

  const onQuickStatus = async (libraryItemId: number, status: "reading" | "read") => {
    try {
      await updateItem(libraryItemId, { status });
      await Promise.all([loadList(), refreshLibrary()]);
      showToast(status === "reading" ? "Passé en « En cours »." : "Passé en « Lus ».", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Mise à jour impossible", "error");
    }
  };

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
    <ScrollView className="flex-1" contentContainerClassName="px-3 pb-8">
      <Text className="mb-1 text-xl font-black text-text dark:text-text-dark">{list?.name ?? "Liste"}</Text>
      <Text className="mb-3 text-sm text-muted dark:text-text-soft-dark">{list?.items.length ?? 0} livre(s)</Text>

      {isLoading ? <BookLoader label="Chargement de la liste" /> : null}
      {isLibraryLoading ? <BookLoader label="Chargement de la bibliothèque" /> : null}
      {error ? <StateText message={error} kind="error" /> : null}

      <View className="mb-6">
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">Dans cette liste</Text>
        {!isLoading && (list?.items.length ?? 0) === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="Liste vide"
            description="Ajoutez un livre depuis votre bibliothèque pour remplir cette liste."
          />
        ) : null}
        {list?.items.map((item) => (
          <Swipeable
            key={item.id}
            renderLeftActions={renderLeftAction}
            renderRightActions={renderRightAction}
            leftThreshold={56}
            rightThreshold={56}
            onSwipeableOpen={(direction) => {
              if (direction === "left") {
                void onQuickStatus(item.id, "reading");
                return;
              }
              void onQuickStatus(item.id, "read");
            }}
          >
            <BookListItem
              book={item.book}
              status={item.status}
              rating={item.rating}
              onPress={() => navigation.navigate("LibraryItem", { itemId: item.id })}
              actions={[
                {
                  key: `remove-${item.id}`,
                  label: "Retirer",
                  tone: "danger",
                  onPress: (event) => {
                    event.stopPropagation();
                    void onRemove(item.id);
                  },
                },
              ]}
            />
          </Swipeable>
        ))}
      </View>

      <View>
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">
          Ajouter depuis ma bibliothèque
        </Text>
        {candidates.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="Tout est déjà ajouté"
            description="Tous les livres de votre bibliothèque sont déjà présents dans cette liste."
          />
        ) : null}
        {candidates.map((item) => (
          <Swipeable
            key={item.id}
            renderLeftActions={renderLeftAction}
            renderRightActions={renderRightAction}
            leftThreshold={56}
            rightThreshold={56}
            onSwipeableOpen={(direction) => {
              if (direction === "left") {
                void onQuickStatus(item.id, "reading");
                return;
              }
              void onQuickStatus(item.id, "read");
            }}
          >
            <BookListItem
              book={item.book}
              status={item.status}
              rating={item.rating}
              onPress={() => navigation.navigate("LibraryItem", { itemId: item.id })}
              actions={[
                {
                  key: `add-${item.id}`,
                  label: "Ajouter à la liste",
                  onPress: (event) => {
                    event.stopPropagation();
                    void onAdd(item.id);
                  },
                },
              ]}
            />
          </Swipeable>
        ))}
      </View>
    </ScrollView>
  );
};

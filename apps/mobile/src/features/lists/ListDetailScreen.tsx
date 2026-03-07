import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ReadingListDetails } from "@readingos/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BookListItem } from "../../components/BookListItem";
import { StateText } from "../../components/StateText";
import { useLibrary } from "../../contexts/LibraryContext";
import { useReadingLists } from "../../contexts/ReadingListsContext";
import { useToast } from "../../contexts/ToastContext";
import type { RootStackParamList } from "../../navigation/types";

type ListDetailRoute = RouteProp<RootStackParamList, "ListDetail">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ListDetailScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<ListDetailRoute>();
  const { listId } = route.params;
  const { items: libraryItems, isLoading: isLibraryLoading, refresh: refreshLibrary } = useLibrary();
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

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-3 pb-8">
      <Text className="mb-1 text-xl font-black text-slate-900 dark:text-slate-100">{list?.name ?? "Liste"}</Text>
      <Text className="mb-3 text-sm text-slate-500 dark:text-slate-300">{list?.items.length ?? 0} livre(s)</Text>

      {isLoading ? <StateText message="Chargement..." /> : null}
      {isLibraryLoading ? <StateText message="Chargement de la bibliothèque..." /> : null}
      {error ? <StateText message={error} kind="error" /> : null}

      <View className="mb-6">
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">Dans cette liste</Text>
        {!isLoading && (list?.items.length ?? 0) === 0 ? <StateText message="Aucun livre dans cette liste." /> : null}
        {list?.items.map((item) => (
          <BookListItem
            key={item.id}
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
        ))}
      </View>

      <View>
        <Text className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
          Ajouter depuis ma bibliothèque
        </Text>
        {candidates.length === 0 ? <StateText message="Tous les livres sont déjà dans la liste." /> : null}
        {candidates.map((item) => (
          <BookListItem
            key={item.id}
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
        ))}
      </View>
    </ScrollView>
  );
};

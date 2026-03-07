import type { LibraryStatus } from "@readingos/shared";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { CoverImage } from "../../components/CoverImage";
import { StatusPill } from "../../components/StatusPill";
import { StatusSelector } from "../../components/StatusSelector";
import { useLibrary } from "../../contexts/LibraryContext";
import { useReadingLists } from "../../contexts/ReadingListsContext";
import { useToast } from "../../contexts/ToastContext";
import { formatPublishedDate } from "../../lib/date";
import { cardInsetClass, cardSurfaceClass } from "../../lib/ui";
import type { RootStackParamList } from "../../navigation/types";

type BookDetailRoute = RouteProp<RootStackParamList, "BookDetail">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const BookDetailScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<BookDetailRoute>();
  const { book } = route.params;
  const { items, addBook } = useLibrary();
  const { lists, addItem } = useReadingLists();
  const { showToast } = useToast();
  const [status, setStatus] = useState<LibraryStatus>("to_read");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const existingItem = useMemo(() => items.find((item) => item.book.sourceId === book.sourceId), [items, book.sourceId]);
  const hasLists = lists.length > 0;

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  const onAdd = async () => {
    try {
      const item = await addBook({ book, status });
      showToast("Livre ajouté à la bibliothèque.", "success");
      navigation.navigate("LibraryItem", { itemId: item.id });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ajout impossible", "error");
    }
  };

  const onAddToList = async () => {
    if (!selectedListId) {
      showToast("Choisis une liste d'abord.", "error");
      return;
    }

    try {
      let libraryItem = existingItem;
      let wasCreated = false;

      if (!libraryItem) {
        libraryItem = await addBook({ book, status });
        wasCreated = true;
      }

      await addItem(selectedListId, libraryItem.id);
      setIsListModalOpen(false);
      showToast("Livre ajouté à la liste.", "success");

      if (wasCreated) {
        showToast("Ajouté automatiquement à la bibliothèque.", "info");
        navigation.navigate("LibraryItem", { itemId: libraryItem.id });
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ajout à la liste impossible", "error");
    }
  };

  const openListModal = () => {
    if (lists.length === 0) {
      showToast("Crée d'abord une liste personnalisée dans l'onglet Listes.", "error");
      return;
    }
    setIsListModalOpen(true);
  };

  return (
    <ScrollView className="flex-1 bg-brand-50 dark:bg-slate-950" contentContainerClassName="pb-8">
      <View className="bg-brand-50 px-4 py-4 dark:bg-slate-950">
        <View className="flex-row">
          <CoverImage uri={book.thumbnail} title={book.title} className="h-52 w-36 rounded-xl" />
          <View className="ml-3 flex-1">
            <Text className="text-lg font-black text-slate-900 dark:text-slate-100" numberOfLines={3}>
              {book.title}
            </Text>
            <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300" numberOfLines={3}>
              {book.authors.join(", ") || "Auteur non renseigné"}
            </Text>
            <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatPublishedDate(book.publishedDate)}</Text>
            {existingItem ? (
              <View className="mt-3 self-start">
                <StatusPill status={existingItem.status} />
              </View>
            ) : null}
          </View>
        </View>

        <Text className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
          {book.description ?? "Description non renseignée."}
        </Text>

        <View className="mt-4 gap-3">
          {!existingItem ? <StatusSelector value={status} onChange={setStatus} /> : null}

          <View className="flex-row gap-2">
            <Pressable
              className={`${hasLists ? "flex-1" : "w-full"} rounded-xl bg-brand-700 px-4 py-3`}
              onPress={() =>
                existingItem ? navigation.navigate("LibraryItem", { itemId: existingItem.id }) : void onAdd()
              }
            >
              <Text className="text-center font-black text-white">
                {existingItem ? "Modifier l'élément" : "Ajouter"}
              </Text>
            </Pressable>

            {hasLists ? (
              <Pressable className="flex-1 rounded-xl bg-slate-900 px-4 py-3" onPress={openListModal}>
                <Text className="text-center font-black text-white">Ajouter à une liste</Text>
              </Pressable>
            ) : null}
          </View>

        </View>
      </View>

      {hasLists ? (
        <Modal animationType="fade" transparent visible={isListModalOpen} onRequestClose={() => setIsListModalOpen(false)}>
          <View className="flex-1 items-center justify-center bg-slate-900/55 px-5">
            <View className={`w-full rounded-2xl p-4 ${cardSurfaceClass}`}>
              <Text className="text-lg font-black text-slate-900 dark:text-slate-100">Choisir une liste</Text>
              <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sélectionne où ajouter ce livre.</Text>

              <View className="mt-4 max-h-72">
                <ScrollView contentContainerClassName="gap-2 pb-2">
                  {lists.map((list) => (
                    <Pressable
                      key={list.id}
                      className={`rounded-lg px-3 py-3 ${
                        selectedListId === list.id ? "bg-brand-100 dark:bg-slate-700" : cardInsetClass
                      }`}
                      onPress={() => setSelectedListId(list.id)}
                    >
                      <Text
                        className={`text-sm font-black ${
                          selectedListId === list.id ? "text-brand-700 dark:text-brand-100" : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {list.name}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-500 dark:text-slate-300">{list.itemCount} livre(s)</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View className="mt-4 flex-row gap-2">
                <Pressable
                  className="flex-1 rounded-xl bg-slate-200 px-4 py-3 dark:bg-slate-700"
                  onPress={() => setIsListModalOpen(false)}
                >
                  <Text className="text-center font-black text-slate-700 dark:text-slate-100">Annuler</Text>
                </Pressable>
                <Pressable className="flex-1 rounded-xl bg-brand-700 px-4 py-3" onPress={() => void onAddToList()}>
                  <Text className="text-center font-black text-white">Ajouter</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </ScrollView>
  );
};

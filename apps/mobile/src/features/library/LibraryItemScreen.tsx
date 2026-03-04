import type { LibraryStatus } from "@readingos/shared";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { CoverImage } from "../../components/CoverImage";
import { StateText } from "../../components/StateText";
import { StatusSelector } from "../../components/StatusSelector";
import { useLibrary } from "../../contexts/LibraryContext";
import { useReadingLists } from "../../contexts/ReadingListsContext";
import { useToast } from "../../contexts/ToastContext";
import { cardInsetClass, cardSurfaceClass } from "../../lib/ui";
import type { RootStackParamList } from "../../navigation/types";

type LibraryItemRoute = RouteProp<RootStackParamList, "LibraryItem">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const LibraryItemScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const route = useRoute<LibraryItemRoute>();
  const { itemId } = route.params;
  const { getById, refresh, updateItem, removeItem, isLoading } = useLibrary();
  const { lists, addItem } = useReadingLists();
  const { showToast } = useToast();
  const item = getById(itemId);

  const [status, setStatus] = useState<LibraryStatus>(
    item?.status ?? "to_read",
  );
  const [rating, setRating] = useState(item?.rating ? String(item.rating) : "");
  const [review, setReview] = useState(item?.review ?? "");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const selectedListName = useMemo(
    () => lists.find((list) => list.id === selectedListId)?.name,
    [lists, selectedListId],
  );

  useEffect(() => {
    if (!item) {
      void refresh();
    }
  }, [item, refresh]);

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  if (!item) {
    return (
      <StateText
        message={isLoading ? "Chargement..." : "Élément introuvable."}
      />
    );
  }

  const onSave = async () => {
    try {
      await updateItem(item.id, {
        status,
        rating: rating ? Number(rating) : null,
        review: review.trim() ? review.trim() : null,
      });
      showToast("Modifications enregistrées.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Mise à jour impossible",
        "error",
      );
    }
  };

  const onDelete = async () => {
    try {
      await removeItem(item.id);
      showToast("Livre supprimé.", "success");
      navigation.goBack();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Suppression impossible",
        "error",
      );
    }
  };

  const onAddToList = async () => {
    if (!selectedListId) {
      showToast("Choisissez une liste d'abord.", "error");
      return;
    }

    try {
      await addItem(selectedListId, item.id);
      setIsListModalOpen(false);
      showToast("Livre ajouté à la liste.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Ajout à la liste impossible",
        "error",
      );
    }
  };

  const openListModal = () => {
    if (lists.length === 0) {
      showToast(
        "Créez d'abord une liste personnalisée dans l'onglet Listes.",
        "error",
      );
      return;
    }
    setIsListModalOpen(true);
  };

  return (
    <ScrollView
      className="flex-1 bg-brand-50 dark:bg-slate-950"
      contentContainerClassName="pb-8"
    >
      <View className="bg-brand-50 px-4 py-4 dark:bg-slate-950">
        <View className="flex-row">
          <CoverImage
            uri={item.book.thumbnail}
            title={item.book.title}
            className="h-44 w-32 rounded-xl"
          />
          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-black text-slate-900 dark:text-slate-100"
              numberOfLines={3}
            >
              {item.book.title}
            </Text>
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {item.book.authors.join(", ") || "Auteur non renseigné"}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <StatusSelector value={status} onChange={setStatus} />
        </View>

        <TextInput
          className="mt-4 rounded-xl bg-slate-100 px-3 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          value={rating}
          onChangeText={setRating}
          placeholder="Note (1-5)"
          keyboardType="number-pad"
        />

        <TextInput
          className="mt-3 min-h-[110px] rounded-xl bg-slate-100 px-3 py-3 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          value={review}
          onChangeText={setReview}
          placeholder="Ton avis"
          multiline
          textAlignVertical="top"
        />

        <View className="mt-4">
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
            Listes personnalisées
          </Text>
          <Pressable
            className="rounded-xl bg-slate-900 px-4 py-3"
            onPress={openListModal}
          >
            <Text className="text-center font-black text-white">
              Choisir une liste
            </Text>
          </Pressable>
          {selectedListName ? (
            <Text className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              Liste sélectionnée:{" "}
              <Text className="font-bold text-slate-800 dark:text-slate-100">
                {selectedListName}
              </Text>
            </Text>
          ) : null}
        </View>

        <View className="mt-4 flex-row gap-2">
          <Pressable
            className="flex-1 rounded-xl bg-brand-700 px-4 py-3"
            onPress={() => void onSave()}
          >
            <Text className="text-center font-black text-white">
              Enregistrer
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-xl bg-red-700 px-4 py-3"
            onPress={() => void onDelete()}
          >
            <Text className="text-center font-black text-white">Supprimer</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isListModalOpen}
        onRequestClose={() => setIsListModalOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-slate-900/55 px-5">
          <View className={`w-full rounded-2xl p-4 ${cardSurfaceClass}`}>
            <Text className="text-lg font-black text-slate-900 dark:text-slate-100">
              Choisir une liste
            </Text>
            <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Sélectionnez où ajouter ce livre.
            </Text>

            <View className="mt-4 max-h-72">
              <ScrollView contentContainerClassName="gap-2 pb-2">
                {lists.map((list) => (
                  <Pressable
                    key={list.id}
                    className={`rounded-lg px-3 py-3 ${
                      selectedListId === list.id
                        ? "bg-brand-100 dark:bg-slate-700"
                        : cardInsetClass
                    }`}
                    onPress={() => setSelectedListId(list.id)}
                  >
                    <Text
                      className={`text-sm font-black ${
                        selectedListId === list.id
                          ? "text-brand-700 dark:text-brand-100"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {list.name}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      {list.itemCount} livre(s)
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mt-4 flex-row gap-2">
              <Pressable
                className="flex-1 rounded-xl bg-slate-200 px-4 py-3 dark:bg-slate-700"
                onPress={() => setIsListModalOpen(false)}
              >
                <Text className="text-center font-black text-slate-700 dark:text-slate-100">
                  Annuler
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 rounded-xl bg-brand-700 px-4 py-3"
                onPress={() => void onAddToList()}
              >
                <Text className="text-center font-black text-white">
                  Ajouter
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

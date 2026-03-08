import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { BookLoader } from "../../components/BookLoader";
import { CoverImage } from "../../components/CoverImage";
import { EmptyState } from "../../components/EmptyState";
import { StateText } from "../../components/StateText";
import { useReadingLists } from "../../contexts/ReadingListsContext";
import { useToast } from "../../contexts/ToastContext";
import { cardSurfaceClass, cardInsetClass } from "../../lib/ui";
import { appColors } from "../../theme/colors";
import type { RootStackParamList } from "../../navigation/types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const ListsScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { lists, isLoading, error, createList, deleteList } = useReadingLists();
  const { showToast } = useToast();
  const [newListName, setNewListName] = useState("");

  const onCreateList = async () => {
    const name = newListName.trim();
    if (!name) {
      showToast("Donne un nom à la liste.", "error");
      return;
    }

    try {
      await createList({ name });
      setNewListName("");
      showToast("Liste créée.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de créer la liste", "error");
    }
  };

  const onDeleteList = async (id: number) => {
    try {
      await deleteList(id);
      showToast("Liste supprimée.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible de supprimer la liste", "error");
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="bookmark" size={20} color={appColors.primaryText} />
        <Text className="text-xl font-black text-text dark:text-text-dark">Mes listes</Text>
      </View>
      <Text className="mb-4 text-sm text-muted dark:text-text-soft-dark">
        Crée des playlists de lecture et ajoute tes livres dedans.
      </Text>

      <View className="mb-4 flex-row items-center gap-2">
        <TextInput
          className={`flex-1 rounded-xl px-3 py-3 text-text dark:text-text-dark ${cardInsetClass}`}
          value={newListName}
          onChangeText={setNewListName}
          placeholder="Nom de la liste"
          returnKeyType="done"
          onSubmitEditing={() => void onCreateList()}
        />
        <Pressable className="rounded-xl bg-primary px-4 py-3" onPress={() => void onCreateList()}>
          <Text className="font-black text-neutral-inverse">Créer</Text>
        </Pressable>
      </View>

      {isLoading ? <BookLoader label="Chargement de vos listes" /> : null}
      {error ? <StateText message={error} kind="error" /> : null}
      {!isLoading && lists.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="Aucune liste pour le moment"
          description="Créez votre première liste de lecture pour organiser vos livres par thème ou envie."
        />
      ) : null}

      <View className="mt-2 gap-3">
        {lists.map((list) => (
          <Pressable
            key={list.id}
            className={`rounded-2xl p-4 shadow-soft ${cardSurfaceClass}`}
            onPress={() => navigation.navigate("ListDetail", { listId: list.id })}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-black text-text dark:text-text-dark" numberOfLines={1}>
                  {list.name}
                </Text>
                <Text className="text-xs text-muted dark:text-text-soft-dark">{list.itemCount} livre(s)</Text>
              </View>
              <Pressable
                className="rounded-full bg-danger px-3 py-2"
                onPress={(event) => {
                  event.stopPropagation();
                  void onDeleteList(list.id);
                }}
                hitSlop={8}
              >
                <Text className="text-xs font-black text-neutral-inverse">Supprimer</Text>
              </Pressable>
            </View>

            {list.previewItems.length === 0 ? (
              <Text className="text-sm text-muted dark:text-text-soft-dark">Liste vide.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {list.previewItems.map((entry) => (
                  <View key={entry.id} className="w-[22%]">
                    <CoverImage uri={entry.book.thumbnail} title={entry.book.title} className="h-24 w-full rounded-lg" />
                    <Text className="mt-1 text-[10px] font-semibold text-text-soft dark:text-text-soft-dark" numberOfLines={2}>
                      {entry.book.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

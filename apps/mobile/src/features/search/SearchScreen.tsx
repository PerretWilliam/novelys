import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Book } from "@readingos/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BookListItem } from "../../components/BookListItem";
import { BookLoader } from "../../components/BookLoader";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { useLibrary } from "../../contexts/LibraryContext";
import { useRecentSearches } from "../../contexts/RecentSearchesContext";
import { useToast } from "../../contexts/ToastContext";
import { useRecommendations } from "../../hooks/useRecommendations";
import { useSearchBooks } from "../../hooks/useSearchBooks";
import { cardInsetClass, cardSurfaceClass } from "../../lib/ui";
import { appColors } from "../../theme/colors";
import type { RootStackParamList } from "../../navigation/types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { searches, addSearch, removeSearch, clearSearches, isLoading: isRecentLoading, error: recentError } =
    useRecentSearches();
  const { items, addBook } = useLibrary();
  const { showToast } = useToast();
  const { exploreBooks, isLoading: isExploreLoading } = useRecommendations();
  const { query, setQuery, lang, suggestions, isSuggesting, hasMore, loadMore } = useSearchBooks();
  const trimmedQuery = query.trim();
  const existingSourceIds = new Set(items.map((item) => item.book.sourceId));
  const [exploreVisibleCount, setExploreVisibleCount] = useState(12);
  const [isClearRecentConfirmOpen, setIsClearRecentConfirmOpen] = useState(false);

  useEffect(() => {
    setExploreVisibleCount(12);
  }, [exploreBooks]);

  const visibleExplore = useMemo(
    () => exploreBooks.slice(0, exploreVisibleCount),
    [exploreBooks, exploreVisibleCount],
  );

  const quickAddToReadList = useCallback(
    async (book: Book) => {
      if (existingSourceIds.has(book.sourceId)) {
        showToast("Ce livre est déjà dans votre bibliothèque.", "info");
        return;
      }

      try {
        await addBook({
          book,
          status: "to_read",
        });
        showToast("Ajouté à « À lire ».", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Ajout impossible", "error");
      }
    },
    [addBook, existingSourceIds, showToast],
  );

  const renderSwipeAction = () => (
    <View className="mb-3 w-28 items-center justify-center rounded-2xl bg-primary">
      <Ionicons name="bookmark" size={20} color={appColors.surface} />
      <Text className="mt-1 text-xs font-black text-neutral-inverse">À lire</Text>
    </View>
  );

  const handleScrollEnd = ({
    nativeEvent,
  }: {
    nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } };
  }) => {
    const paddingToBottom = 200;
    const reachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;
    if (!reachedBottom) {
      return;
    }

    if (trimmedQuery.length >= 2) {
      if (hasMore && !isSuggesting) {
        loadMore();
      }
      return;
    }

    if (visibleExplore.length < exploreBooks.length) {
      setExploreVisibleCount((prev) => Math.min(prev + 8, exploreBooks.length));
    }
  };

  return (
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="pb-8"
      onScroll={handleScrollEnd}
      scrollEventThrottle={16}
    >
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="search" size={20} color={appColors.primaryText} />
        <Text className="text-xl font-black text-text dark:text-text-dark">Recherche</Text>
      </View>

      <View className="mb-2 flex-row items-center gap-2">
        <TextInput
          className={`flex-1 rounded-xl px-3 py-3 text-text dark:text-text-dark ${cardInsetClass}`}
          value={query}
          onChangeText={setQuery}
          placeholder="Titre, auteur, ISBN"
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => {
            const next = trimmedQuery;
            if (next) {
              addSearch(next, lang);
            }
          }}
        />
      </View>

      {trimmedQuery.length < 2 && searches.length > 0 ? (
        <View className={`mb-4 rounded-2xl p-3 ${cardSurfaceClass}`}>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={18} color={appColors.primaryText} />
              <Text className="text-base font-extrabold text-text dark:text-text-dark">Recherches récentes</Text>
            </View>
            <Pressable onPress={() => setIsClearRecentConfirmOpen(true)}>
              <Text className="text-xs font-bold text-primary-text">Effacer</Text>
            </Pressable>
          </View>

          <View className="gap-2">
            {searches.map((entry) => (
              <View key={entry.id} className={`flex-row items-center justify-between rounded-xl px-3 py-2 ${cardInsetClass}`}>
                <Pressable
                  className="mr-2 flex-1"
                  onPress={() => {
                    setQuery(entry.query);
                  }}
                >
                  <Text className="text-sm font-bold text-text dark:text-text-dark" numberOfLines={1}>
                    {entry.query}
                  </Text>
                  <Text className="text-[11px] text-muted dark:text-text-soft-dark">Langue: {entry.lang.toUpperCase()}</Text>
                </Pressable>
                <Pressable onPress={() => removeSearch(entry.id)}>
                  <Ionicons name="close-circle" size={20} color={appColors.dangerText} />
                </Pressable>
              </View>
            ))}
          </View>
          {isRecentLoading ? <Text className="mt-2 text-xs text-muted dark:text-muted-dark">Synchronisation...</Text> : null}
          {recentError ? <Text className="mt-2 text-xs text-danger-text dark:text-danger-soft">{recentError}</Text> : null}
        </View>
      ) : null}

      {isSuggesting ? <BookLoader label="Recherche en cours" /> : null}
      {!isSuggesting && trimmedQuery.length >= 2 && suggestions.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Aucun livre trouvé"
          description="Essayez un autre titre, auteur ou ISBN."
        />
      ) : null}

      <View className="mt-2">
        {trimmedQuery.length >= 2 &&
          suggestions.map((book) => (
            <Swipeable
              key={book.sourceId}
              renderLeftActions={renderSwipeAction}
              renderRightActions={renderSwipeAction}
              leftThreshold={56}
              rightThreshold={56}
              onSwipeableOpen={() => void quickAddToReadList(book)}
            >
              <BookListItem
                book={book}
                onPress={() => {
                  addSearch(trimmedQuery, lang);
                  navigation.navigate("BookDetail", { book });
                }}
              />
            </Swipeable>
          ))}
        {trimmedQuery.length >= 2 && hasMore ? (
          <Pressable
            className="mb-3 mt-1 items-center rounded-xl bg-surface-3 px-4 py-3 dark:bg-surface-3-dark"
            onPress={loadMore}
            disabled={isSuggesting}
          >
            <Text className="text-sm font-black text-primary-text dark:text-primary-soft">
              {isSuggesting ? "Chargement..." : "Rechercher plus"}
            </Text>
          </Pressable>
        ) : null}
        {trimmedQuery.length < 2 ? (
          <>
            <View className={`mb-3 mt-2 rounded-2xl p-3 ${cardSurfaceClass}`}>
              <View className="mb-1 flex-row items-center gap-2">
                <Ionicons name="compass-outline" size={18} color={appColors.primaryText} />
                <Text className="text-base font-extrabold text-text dark:text-text-dark">À explorer</Text>
              </View>
              <Text className="text-xs text-muted dark:text-text-soft-dark">
                Découvrez de nouveaux livres pendant que vous ne cherchez rien.
              </Text>
            </View>

            {isExploreLoading ? <BookLoader label="Préparation des livres à explorer" /> : null}
            {!isExploreLoading &&
              visibleExplore.map((book) => (
                <Swipeable
                  key={book.sourceId}
                  renderLeftActions={renderSwipeAction}
                  renderRightActions={renderSwipeAction}
                  leftThreshold={56}
                  rightThreshold={56}
                  onSwipeableOpen={() => void quickAddToReadList(book)}
                >
                  <BookListItem
                    book={book}
                    onPress={() => {
                      navigation.navigate("BookDetail", { book });
                    }}
                  />
                </Swipeable>
              ))}
            {!isExploreLoading && exploreBooks.length === 0 ? (
              <EmptyState
                icon="compass-outline"
                title="Rien à explorer pour le moment"
                description="Revenez plus tard, de nouvelles suggestions seront proposées."
              />
            ) : null}
          </>
        ) : null}
      </View>

      <ConfirmDialog
        visible={isClearRecentConfirmOpen}
        title="Effacer les recherches récentes ?"
        message="Cette action supprime tout votre historique de recherches."
        confirmLabel="Tout effacer"
        cancelLabel="Annuler"
        onCancel={() => setIsClearRecentConfirmOpen(false)}
        onConfirm={() => {
          setIsClearRecentConfirmOpen(false);
          clearSearches();
        }}
      />
    </ScrollView>
  );
};

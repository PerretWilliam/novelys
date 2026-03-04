import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { BookListItem } from "../../components/BookListItem";
import { CoverImage } from "../../components/CoverImage";
import { StateText } from "../../components/StateText";
import { useRecentSearches } from "../../contexts/RecentSearchesContext";
import { useSearchBooks } from "../../hooks/useSearchBooks";
import { cardInsetClass, cardSurfaceClass } from "../../lib/ui";
import type { RootStackParamList } from "../../navigation/types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { searches, addSearch, removeSearch, clearSearches, isLoading: isRecentLoading, error: recentError } =
    useRecentSearches();
  const { query, setQuery, lang, setLang, results, suggestions, isSuggesting, isLoading, error, runSearch } =
    useSearchBooks();

  const onSubmitSearch = async (nextQuery?: string, langOverride?: "fr" | "en") => {
    const executedQuery = await runSearch(nextQuery, langOverride);
    if (executedQuery) {
      addSearch(executedQuery, langOverride ?? lang);
    }
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="search" size={20} color="#0F4C81" />
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100">Recherche</Text>
      </View>

      <View className="mb-2 flex-row items-center gap-2">
        <TextInput
          className={`flex-1 rounded-xl px-3 py-3 text-slate-900 dark:text-slate-100 ${cardInsetClass}`}
          value={query}
          onChangeText={setQuery}
          placeholder="Titre, auteur, ISBN"
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => void onSubmitSearch()}
        />
        <Pressable className="rounded-xl bg-brand-700 px-4 py-3" onPress={() => void onSubmitSearch()}>
          <Text className="font-black text-white">Chercher</Text>
        </Pressable>
      </View>

      {query.trim().length >= 2 ? (
        <View className={`mb-3 rounded-xl px-2 py-2 ${cardSurfaceClass}`}>
          {isSuggesting ? <Text className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">Suggestions...</Text> : null}
          {!isSuggesting && suggestions.length === 0 ? (
            <Text className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">Aucune suggestion</Text>
          ) : null}
          {suggestions.map((book) => (
            <Pressable
              key={book.sourceId}
              className="mb-1 flex-row items-center rounded-lg border border-white bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-800"
              onPress={() => navigation.navigate("BookDetail", { book })}
            >
              <CoverImage uri={book.thumbnail} title={book.title} className="h-12 w-8 rounded-md" />
              <View className="ml-2 flex-1">
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-100" numberOfLines={1}>
                  {book.title}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-300" numberOfLines={1}>
                  {book.authors.join(", ") || "Auteur non renseigné"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {query.trim().length < 2 ? (
        <View className={`mb-4 rounded-2xl p-3 ${cardSurfaceClass}`}>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={18} color="#0F4C81" />
              <Text className="text-base font-extrabold text-slate-900 dark:text-slate-100">Recherches récentes</Text>
            </View>
            {searches.length > 0 ? (
              <Pressable onPress={clearSearches}>
                <Text className="text-xs font-bold text-brand-700">Effacer</Text>
              </Pressable>
            ) : null}
          </View>

          {searches.length === 0 ? (
            <Text className="text-xs text-slate-500 dark:text-slate-400">Aucune recherche récente.</Text>
          ) : (
            <View className="gap-2">
              {searches.map((entry) => (
                <View key={entry.id} className={`flex-row items-center justify-between rounded-xl px-3 py-2 ${cardInsetClass}`}>
                  <Pressable
                    className="mr-2 flex-1"
                    onPress={() => {
                      setLang(entry.lang);
                      setQuery(entry.query);
                      void onSubmitSearch(entry.query, entry.lang);
                    }}
                  >
                    <Text className="text-sm font-bold text-slate-800 dark:text-slate-100" numberOfLines={1}>
                      {entry.query}
                    </Text>
                    <Text className="text-[11px] text-slate-500 dark:text-slate-300">Langue: {entry.lang.toUpperCase()}</Text>
                  </Pressable>
                  <Pressable onPress={() => removeSearch(entry.id)}>
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {isRecentLoading ? <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">Synchronisation...</Text> : null}
          {recentError ? <Text className="mt-2 text-xs text-red-600 dark:text-red-400">{recentError}</Text> : null}
        </View>
      ) : null}

      <View className="mb-3 flex-row gap-2">
        <Pressable
          className={`rounded-full px-3 py-2 ${lang === "fr" ? "bg-brand-700" : "bg-white dark:bg-slate-700"}`}
          onPress={() => setLang("fr")}
        >
          <Text className={`text-xs font-black ${lang === "fr" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}>
            FR
          </Text>
        </Pressable>
        <Pressable
          className={`rounded-full px-3 py-2 ${lang === "en" ? "bg-brand-700" : "bg-white dark:bg-slate-700"}`}
          onPress={() => setLang("en")}
        >
          <Text className={`text-xs font-black ${lang === "en" ? "text-white" : "text-brand-700 dark:text-brand-100"}`}>
            EN
          </Text>
        </Pressable>
      </View>

      {isLoading ? <StateText message="Chargement..." /> : null}
      {error ? <StateText message={error} kind="error" /> : null}
      {!isLoading && results.length === 0 ? <StateText message="Lance une recherche pour afficher des livres." /> : null}

      <View className="mt-2">
        {results.map((book) => (
          <BookListItem key={book.sourceId} book={book} onPress={() => navigation.navigate("BookDetail", { book })} />
        ))}
      </View>
    </ScrollView>
  );
};

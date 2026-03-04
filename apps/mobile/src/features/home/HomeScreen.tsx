import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { RecommendedBookCard } from "../../components/RecommendedBookCard";
import { useRecommendations } from "../../hooks/useRecommendations";
import { cardSurfaceClass } from "../../lib/ui";
import type { RootStackParamList } from "../../navigation/types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { recommendedForYou, exploreBooks, isLoading, error, hasPersonalSignals, refresh } = useRecommendations();

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="home" size={20} color="#0F4C81" />
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100">Accueil</Text>
      </View>

      <View className={`mb-4 rounded-2xl p-3 ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles-outline" size={18} color="#0F4C81" />
            <Text className="text-base font-extrabold text-slate-900 dark:text-slate-100">Recommandés pour vous</Text>
          </View>
          <Pressable className="rounded-full bg-slate-200 px-3 py-1.5 dark:bg-slate-800" onPress={() => void refresh()}>
            <Text className="text-xs font-bold text-brand-700 dark:text-brand-100">Actualiser</Text>
          </Pressable>
        </View>
        <Text className="text-xs text-slate-600 dark:text-slate-300">
          {hasPersonalSignals
            ? "Basés sur votre bibliothèque et vos listes."
            : "Suggestions pour démarrer votre bibliothèque."}
        </Text>
      </View>

      {isLoading ? <Text className="text-sm text-slate-500 dark:text-slate-400">Chargement des recommandations...</Text> : null}
      {!isLoading && error ? <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text> : null}

      {!isLoading && !error ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="mb-4 pr-2">
            {recommendedForYou.map((book) => (
              <RecommendedBookCard
                key={book.sourceId}
                book={book}
                tone="brand"
                onPress={() => navigation.navigate("BookDetail", { book })}
              />
            ))}
          </ScrollView>
          {recommendedForYou.length === 0 ? (
            <Text className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Aucune recommandation personnalisée pour le moment.
            </Text>
          ) : null}

          <View className={`mb-3 rounded-2xl p-3 ${cardSurfaceClass}`}>
            <View className="mb-1 flex-row items-center gap-2">
              <Ionicons name="book-outline" size={18} color="#0F4C81" />
              <Text className="text-base font-extrabold text-slate-900 dark:text-slate-100">À explorer</Text>
            </View>
            <Text className="text-xs text-slate-600 dark:text-slate-300">Sélection découverte pour varier vos lectures.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="pr-2">
            {exploreBooks.slice(0, 8).map((book) => (
              <RecommendedBookCard
                key={book.sourceId}
                book={book}
                tone="amber"
                onPress={() => navigation.navigate("BookDetail", { book })}
              />
            ))}
          </ScrollView>
          {exploreBooks.length === 0 ? (
            <Text className="text-sm text-slate-500 dark:text-slate-400">Aucun livre à explorer pour le moment.</Text>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
};

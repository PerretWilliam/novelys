import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BookListItem } from "../../components/BookListItem";
import { BookLoader } from "../../components/BookLoader";
import { EmptyState } from "../../components/EmptyState";
import { useRecommendations } from "../../hooks/useRecommendations";
import { cardSurfaceClass } from "../../lib/ui";
import { appColors } from "../../theme/colors";
import type { RootStackParamList } from "../../navigation/types";

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { recommendedForYou, isLoading, error, hasPersonalSignals, refresh } = useRecommendations();
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [recommendedForYou]);

  const visibleRecommended = useMemo(
    () => recommendedForYou.slice(0, visibleCount),
    [recommendedForYou, visibleCount],
  );

  const handleScrollEnd = ({
    nativeEvent,
  }: {
    nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } };
  }) => {
    const paddingToBottom = 180;
    const reachedBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;
    if (!reachedBottom) {
      return;
    }
    setVisibleCount((prev) => Math.min(prev + 8, recommendedForYou.length));
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-8" onScroll={handleScrollEnd} scrollEventThrottle={16}>
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="home" size={20} color={appColors.primaryText} />
        <Text className="text-xl font-black text-text dark:text-text-dark">Accueil</Text>
      </View>

      <View className={`mb-4 rounded-2xl p-3 ${cardSurfaceClass}`}>
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles-outline" size={18} color={appColors.primaryText} />
            <Text className="text-base font-extrabold text-text dark:text-text-dark">Recommandés pour vous</Text>
          </View>
          <Pressable className="rounded-full bg-surface-3 px-3 py-1.5 dark:bg-surface-2-dark" onPress={() => void refresh()}>
            <Text className="text-xs font-bold text-primary-text dark:text-primary-soft">Actualiser</Text>
          </Pressable>
        </View>
        <Text className="text-xs text-muted dark:text-text-soft-dark">
          {hasPersonalSignals
            ? "Basés sur votre bibliothèque et vos listes."
            : "Suggestions pour démarrer votre bibliothèque."}
        </Text>
      </View>

      {isLoading ? <BookLoader label="Préparation de vos recommandations" /> : null}
      {!isLoading && error ? <Text className="text-sm text-danger-text dark:text-danger-soft">{error}</Text> : null}

      {!isLoading && !error ? (
        <>
          <View className="mb-4">
            {visibleRecommended.map((book) => (
              <BookListItem
                key={book.sourceId}
                book={book}
                onPress={() => navigation.navigate("BookDetail", { book })}
              />
            ))}
          </View>
          {recommendedForYou.length === 0 ? (
            <EmptyState
              icon="sparkles-outline"
              title="Pas encore de recommandations"
              description="Ajoutez quelques livres à votre bibliothèque pour recevoir des suggestions personnalisées."
            />
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
};

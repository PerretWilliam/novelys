import type { Book } from "@readingos/shared";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { cardSurfaceClass } from "../lib/ui";
import { CoverImage } from "./CoverImage";

type Props = {
  book: Book;
  onPress: () => void;
  tone?: "brand" | "amber";
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  brand: cardSurfaceClass,
  amber: cardSurfaceClass,
};

const RecommendedBookCardComponent = ({ book, onPress, tone = "brand" }: Props) => {
  return (
    <Pressable className={`mr-3 w-36 rounded-2xl border p-2 shadow-soft ${toneClass[tone]}`} onPress={onPress}>
      <CoverImage uri={book.thumbnail} title={book.title} className="h-44 w-full rounded-xl" />
      <View className="mt-2">
        <Text className="text-sm font-bold text-slate-900 dark:text-slate-100" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300" numberOfLines={1}>
          {book.authors[0] ?? "Auteur inconnu"}
        </Text>
      </View>
    </Pressable>
  );
};

export const RecommendedBookCard = memo(RecommendedBookCardComponent);

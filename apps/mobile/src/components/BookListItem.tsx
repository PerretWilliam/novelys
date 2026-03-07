import type { Book, LibraryStatus } from "@readingos/shared";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import { formatPublishedDate } from "../lib/date";
import { cardSurfaceClass } from "../lib/ui";
import { CoverImage } from "./CoverImage";
import { StatusPill } from "./StatusPill";

type BookListItemAction = {
  key: string;
  label: string;
  tone?: "primary" | "danger";
  onPress: (event: GestureResponderEvent) => void;
};

type Props = {
  book: Book;
  onPress: () => void;
  status?: LibraryStatus;
  rating?: number;
  actions?: BookListItemAction[];
};

const iconForRating = (rating: number, star: number): keyof typeof Ionicons.glyphMap => {
  if (rating >= star) {
    return "star";
  }
  if (rating >= star - 0.5) {
    return "star-half";
  }
  return "star-outline";
};

const BookListItemComponent = ({ book, onPress, status, rating, actions = [] }: Props) => {
  const shouldShowRating = status !== undefined && typeof rating === "number" && rating > 0;

  return (
    <Pressable className={`mb-3 flex-row rounded-2xl p-3 shadow-soft ${cardSurfaceClass}`} onPress={onPress}>
      <CoverImage uri={book.thumbnail} title={book.title} className="h-36 w-24 rounded-xl" />
      <View className="ml-3 flex-1 gap-1">
        <Text className="text-base font-extrabold text-brand-700 dark:text-slate-100" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="text-sm text-slate-600 dark:text-slate-300" numberOfLines={2}>
          {book.authors.length > 0 ? book.authors.join(", ") : "Auteur non renseigné"}
        </Text>
        <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatPublishedDate(book.publishedDate)}</Text>
        {status ? (
          <View className="self-start">
            <StatusPill status={status} />
          </View>
        ) : null}
        {shouldShowRating ? (
          <View className="mt-1 flex-row items-center">
            {Array.from({ length: 5 }, (_, index) => (
              <Ionicons key={`rating-${index + 1}`} name={iconForRating(rating, index + 1)} size={14} color="#F59E0B" />
            ))}
            <Text className="ml-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {rating.toFixed(1).replace(".", ",")}/5
            </Text>
          </View>
        ) : null}
        {actions.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {actions.map((action) => (
              <Pressable
                key={action.key}
                className={`self-start rounded-full px-3 py-2 ${
                  action.tone === "danger" ? "bg-red-700" : "bg-brand-700"
                }`}
                onPress={action.onPress}
              >
                <Text className="text-xs font-black text-white">{action.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

export const BookListItem = memo(BookListItemComponent);

import type { Book, LibraryStatus } from "@readingos/shared";
import { memo } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, Text, View } from "react-native";
import { usePreferences } from "../contexts/PreferencesContext";
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
  actions?: BookListItemAction[];
};

const BookListItemComponent = ({ book, onPress, status, actions = [] }: Props) => {
  const { showCovers, compactMode } = usePreferences();

  return (
    <Pressable
      className={`mb-3 rounded-2xl p-3 shadow-soft ${cardSurfaceClass} ${compactMode ? "" : "flex-row"}`}
      onPress={onPress}
    >
      {showCovers ? <CoverImage uri={book.thumbnail} title={book.title} className="h-36 w-24 rounded-xl" /> : null}
      <View className={`${showCovers && !compactMode ? "ml-3" : ""} flex-1 gap-1`}>
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

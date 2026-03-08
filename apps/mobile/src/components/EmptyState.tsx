import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { appColors } from "../theme/colors";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

export const EmptyState = ({ icon = "book-outline", title, description }: Props) => {
  return (
    <View className="mt-6 items-center rounded-2xl border border-border bg-surface px-6 py-8 dark:border-border-dark dark:bg-surface-dark">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-soft dark:bg-surface-2-dark">
        <Ionicons name={icon} size={28} color={appColors.primaryText} />
      </View>
      <Text className="mt-4 text-center text-lg font-black text-text dark:text-text-dark">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-muted dark:text-text-soft-dark">{description}</Text>
    </View>
  );
};

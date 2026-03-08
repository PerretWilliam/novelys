import type { LibraryStatus } from "@readingos/shared";
import { Pressable, Text, View } from "react-native";
import { orderedStatuses, statusLabel } from "../lib/status";

type Props = {
  value: LibraryStatus;
  onChange: (next: LibraryStatus) => void;
};

export const StatusSelector = ({ value, onChange }: Props) => {
  return (
    <View className="flex-row flex-wrap gap-2">
      {orderedStatuses.map((status) => (
        <Pressable
          key={status}
          className={`self-start rounded-full px-3 py-2 ${
            value === status ? "bg-primary" : "bg-primary-soft dark:bg-surface-3-dark"
          }`}
          onPress={() => onChange(status)}
        >
          <Text className={`text-xs font-black ${value === status ? "text-neutral-inverse" : "text-primary-text dark:text-primary-soft"}`}>
            {statusLabel[status]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

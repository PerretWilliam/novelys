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
            value === status ? "bg-brand-700" : "bg-brand-100 dark:bg-slate-700"
          }`}
          onPress={() => onChange(status)}
        >
          <Text className={`text-xs font-black ${value === status ? "text-white" : "text-brand-700 dark:text-brand-100"}`}>
            {statusLabel[status]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

import type { LibraryStatus } from "@readingos/shared";
import { Text } from "react-native";
import { statusLabel, statusTone } from "../lib/status";

export const StatusPill = ({ status }: { status: LibraryStatus }) => {
  return <Text className={`self-start rounded-full px-2 py-1 text-xs font-bold ${statusTone[status]}`}>{statusLabel[status]}</Text>;
};

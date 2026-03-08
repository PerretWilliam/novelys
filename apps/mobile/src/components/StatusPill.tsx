import type { LibraryStatus } from "@readingos/shared";
import { Text } from "react-native";
import { statusLabel, statusTone } from "../lib/status";

export const StatusPill = ({ status }: { status: LibraryStatus }) => {
  return (
    <Text
      allowFontScaling={false}
      className={`self-start rounded-full px-2.5 py-1.5 text-[11px] font-bold leading-4 ${statusTone[status]}`}
    >
      {statusLabel[status]}
    </Text>
  );
};

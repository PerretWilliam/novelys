import { Text } from "react-native";

export const StateText = ({
  message,
  kind = "default",
}: {
  message: string;
  kind?: "default" | "error" | "success";
}) => {
  const color =
    kind === "error"
      ? "text-red-700 dark:text-red-400"
      : kind === "success"
        ? "text-emerald-700 dark:text-emerald-400"
        : "text-slate-600 dark:text-slate-300";
  return <Text className={`mt-2 text-sm ${color}`}>{message}</Text>;
};

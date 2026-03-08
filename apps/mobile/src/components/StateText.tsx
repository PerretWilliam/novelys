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
      ? "text-danger dark:text-danger-soft"
      : kind === "success"
        ? "text-success dark:text-success-soft"
        : "text-muted dark:text-text-soft-dark";
  return <Text className={`mt-2 text-sm ${color}`}>{message}</Text>;
};

import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-overlay px-5" onPress={onCancel}>
        <Pressable className="w-full max-w-md rounded-2xl bg-surface p-4 dark:bg-surface-dark">
          <Text className="text-lg font-black text-text dark:text-text-dark">{title}</Text>
          <Text className="mt-2 text-sm text-muted dark:text-text-soft-dark">{message}</Text>

          <View className="mt-4 flex-row gap-2">
            <Pressable className="flex-1 rounded-xl bg-surface-3 px-4 py-3 dark:bg-surface-3-dark" onPress={onCancel}>
              <Text className="text-center font-black text-text-soft dark:text-text-dark">{cancelLabel}</Text>
            </Pressable>
            <Pressable className="flex-1 rounded-xl bg-danger px-4 py-3" onPress={onConfirm}>
              <Text className="text-center font-black text-neutral-inverse">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

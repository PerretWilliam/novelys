import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { appColors } from "../theme/colors";

type Props = {
  value: number | null;
  onChange: (next: number | null) => void;
  disabled?: boolean;
};

const iconForValue = (value: number | null, star: number): keyof typeof Ionicons.glyphMap => {
  if (value !== null && value >= star) {
    return "star";
  }
  if (value !== null && value >= star - 0.5) {
    return "star-half";
  }
  return "star-outline";
};

const formatRatingLabel = (value: number | null): string => {
  if (value === null) {
    return "Aucune note";
  }
  return `${value.toFixed(1).replace(".", ",")} / 5`;
};

export const RatingStars = ({ value, onChange, disabled = false }: Props) => {
  return (
    <View className="mt-4 rounded-xl bg-surface-2 px-3 py-3 dark:bg-surface-2-dark">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-muted dark:text-text-soft-dark">Note</Text>
        <Text className="text-xs font-semibold text-text-soft dark:text-text-dark">{formatRatingLabel(value)}</Text>
      </View>

      <View className="mt-2 flex-row items-center">
        {Array.from({ length: 5 }, (_, index) => {
          const star = index + 1;
          const iconName = iconForValue(value, star);
          const color = value !== null ? appColors.warningText : appColors.mutedDark;

          return (
            <View key={star} className="relative mr-1 h-9 w-9 items-center justify-center">
              <Ionicons name={iconName} size={30} color={color} />
              <Pressable
                className="absolute inset-0"
                disabled={disabled}
                onPress={(event) => {
                  const nextValue = event.nativeEvent.locationX < 18 ? star - 0.5 : star;
                  onChange(nextValue);
                }}
              />
            </View>
          );
        })}

        <Pressable
          className="ml-2 rounded-full bg-surface-3 px-3 py-2 dark:bg-surface-3-dark"
          disabled={disabled}
          onPress={() => onChange(null)}
        >
          <Text className="text-xs font-black text-text-soft dark:text-text-dark">Effacer</Text>
        </Pressable>
      </View>

      <Text className="mt-2 text-xs text-muted dark:text-text-soft-dark">
        Touchez la moitie gauche ou droite d'une etoile pour choisir le demi-point.
      </Text>
    </View>
  );
};

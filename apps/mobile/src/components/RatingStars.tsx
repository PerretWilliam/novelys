import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

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
    <View className="mt-4 rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">Note</Text>
        <Text className="text-xs font-semibold text-slate-700 dark:text-slate-100">{formatRatingLabel(value)}</Text>
      </View>

      <View className="mt-2 flex-row items-center">
        {Array.from({ length: 5 }, (_, index) => {
          const star = index + 1;
          const iconName = iconForValue(value, star);
          const color = value !== null ? "#F59E0B" : "#94A3B8";

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
          className="ml-2 rounded-full bg-slate-200 px-3 py-2 dark:bg-slate-700"
          disabled={disabled}
          onPress={() => onChange(null)}
        >
          <Text className="text-xs font-black text-slate-700 dark:text-slate-100">Effacer</Text>
        </Pressable>
      </View>

      <Text className="mt-2 text-xs text-slate-500 dark:text-slate-300">
        Touchez la moitie gauche ou droite d'une etoile pour choisir le demi-point.
      </Text>
    </View>
  );
};

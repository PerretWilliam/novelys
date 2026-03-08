import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { appColors } from "../theme/colors";

type Props = {
  label?: string;
};

export const BookLoader = ({ label = "Chargement de votre bibliothèque..." }: Props) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    spinLoop.start();

    return () => {
      spinLoop.stop();
      spinAnim.setValue(0);
    };
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="mt-6 items-center justify-center py-4">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-border dark:border-border-dark">
          <Ionicons name="book" size={22} color={appColors.primaryText} />
        </View>
      </Animated.View>
      <Text className="mt-3 text-center text-sm font-semibold text-muted dark:text-text-soft-dark">{label}</Text>
    </View>
  );
};

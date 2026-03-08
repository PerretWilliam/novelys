import { memo, useState } from "react";
import { Image, Text, View } from "react-native";

type Props = {
  uri?: string;
  title: string;
  className?: string;
};

const CoverImageComponent = ({ uri, title, className = "h-36 w-24 rounded-xl" }: Props) => {
  const [hasError, setHasError] = useState(false);

  if (!uri || hasError) {
    return (
      <View className={`${className} items-center justify-center bg-surface-3 dark:bg-surface-2-dark`}>
        <Text className="px-2 text-center text-xs font-semibold text-muted dark:text-text-soft-dark">
          Couverture indisponible
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      accessibilityLabel={title}
      onError={() => setHasError(true)}
      className={`${className} bg-surface-3 dark:bg-surface-2-dark`}
      resizeMode="cover"
    />
  );
};

export const CoverImage = memo(CoverImageComponent);

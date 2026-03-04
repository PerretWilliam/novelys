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
      <View className={`${className} items-center justify-center bg-slate-200 dark:bg-slate-800`}>
        <Text className="px-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-300">
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
      className={`${className} bg-slate-200 dark:bg-slate-800`}
      resizeMode="cover"
    />
  );
};

export const CoverImage = memo(CoverImageComponent);

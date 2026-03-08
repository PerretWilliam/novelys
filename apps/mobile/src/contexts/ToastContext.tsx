import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastKind = "success" | "error" | "info";

type ToastValue = {
  showToast: (message: string, kind?: ToastKind, durationMs?: number) => void;
};

type ToastState = {
  id: number;
  message: string;
  kind: ToastKind;
};

const ToastContext = createContext<ToastValue | null>(null);

const toneClass: Record<ToastKind, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-surface-dark",
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -24,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message: string, kind: ToastKind = "info", durationMs = 2200) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const nextId = ++idRef.current;
      setToast({ id: nextId, message, kind });
      translateY.setValue(-24);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, durationMs);
    },
    [hideToast, opacity, translateY],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={{ position: "absolute", top: insets.top + 8, left: 12, right: 12, zIndex: 1000 }}>
          <Animated.View
            style={{
              transform: [{ translateY }],
              opacity,
            }}
            className={`rounded-xl px-4 py-3 shadow-soft ${toneClass[toast.kind]}`}
          >
            <Text className="text-sm font-bold text-neutral-inverse">{toast.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastValue => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast doit être utilisé dans ToastProvider");
  }
  return value;
};

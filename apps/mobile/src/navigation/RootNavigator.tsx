import Ionicons from "@expo/vector-icons/Ionicons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePreferences } from "../contexts/PreferencesContext";
import { BookDetailScreen } from "../features/book/BookDetailScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import { LibraryItemScreen } from "../features/library/LibraryItemScreen";
import { LibraryScreen } from "../features/library/LibraryScreen";
import { ListDetailScreen } from "../features/lists/ListDetailScreen";
import { ListsScreen } from "../features/lists/ListsScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { SearchScreen } from "../features/search/SearchScreen";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabsNavigator = () => {
  const insets = useSafeAreaInsets();
  const { resolvedTheme } = usePreferences();
  const isDark = resolvedTheme === "dark";

  const tabScreenOptions = ({
    route,
  }: {
    route: { name: keyof MainTabParamList };
  }): BottomTabNavigationOptions => {
    const iconMap: Record<
      keyof MainTabParamList,
      keyof typeof Ionicons.glyphMap
    > = {
      HomeTab: "home-outline",
      SearchTab: "search-outline",
      LibraryTab: "library-outline",
      ListsTab: "bookmark-outline",
      ProfileTab: "person-outline",
    };

    const activeIconMap: Record<
      keyof MainTabParamList,
      keyof typeof Ionicons.glyphMap
    > = {
      HomeTab: "home",
      SearchTab: "search",
      LibraryTab: "library",
      ListsTab: "bookmark",
      ProfileTab: "person",
    };

    return {
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: isDark ? "#E2E8F0" : "#0F172A",
      tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
      tabBarStyle: {
        height: 62 + insets.bottom,
        paddingTop: 8,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        borderTopWidth: 1,
        borderTopColor: isDark ? "#334155" : "#E2E8F0",
        backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
        elevation: 0,
      },
      tabBarItemStyle: {
        paddingTop: 2,
      },
      tabBarIcon: ({ focused }) => (
        <View
          style={{
            minWidth: 36,
            height: 28,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: focused ? (isDark ? "#1E293B" : "#E0ECFF") : "transparent",
          }}
        >
          <Ionicons
            name={focused ? activeIconMap[route.name] : iconMap[route.name]}
            size={22}
            color={focused ? (isDark ? "#E2E8F0" : "#0F172A") : isDark ? "#94A3B8" : "#64748B"}
          />
        </View>
      ),
      sceneStyle: {
        backgroundColor: isDark ? "#020617" : "#EEF8FF",
        paddingHorizontal: 12,
        paddingTop: insets.top + 8,
        paddingBottom: 0,
      },
    };
  };

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Accueil" }} />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: "Recherche" }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryScreen}
        options={{ title: "Bibliothèque" }}
      />
      <Tab.Screen
        name="ListsTab"
        component={ListsScreen}
        options={{ title: "Listes" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { resolvedTheme } = usePreferences();
  const isDark = resolvedTheme === "dark";

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#020617",
          card: "#0F172A",
          text: "#E2E8F0",
          border: "#334155",
          primary: "#93C5FD",
        },
      }
    : undefined;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
          headerTintColor: isDark ? "#E2E8F0" : "#0F4C81",
          headerTitleStyle: { fontWeight: "700", color: isDark ? "#E2E8F0" : "#0F172A" },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: isDark ? "#020617" : "#EEF8FF" },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{ title: "Détails du livre", contentStyle: { backgroundColor: isDark ? "#020617" : "#FFFFFF" } }}
        />
        <Stack.Screen
          name="ListDetail"
          component={ListDetailScreen}
          options={{ title: "Liste" }}
        />
        <Stack.Screen
          name="LibraryItem"
          component={LibraryItemScreen}
          options={{ title: "Modifier l'élément", contentStyle: { backgroundColor: isDark ? "#020617" : "#FFFFFF" } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

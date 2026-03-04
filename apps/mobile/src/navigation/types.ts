import type { Book, LibraryStatus } from "@readingos/shared";

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  LibraryTab: { status?: LibraryStatus } | undefined;
  ListsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  BookDetail: { book: Book };
  LibraryItem: { itemId: number };
  ListDetail: { listId: number };
};

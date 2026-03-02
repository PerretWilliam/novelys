CREATE TABLE IF NOT EXISTS `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`source_id` text NOT NULL,
	`isbn13` text,
	`isbn10` text,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`publisher` text,
	`published_date` text,
	`description` text,
	`page_count` integer,
	`categories` text,
	`language` text,
	`thumbnail` text,
	`preview_link` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `books_source_source_id_unique` ON `books` (`source`,`source_id`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `books_isbn13_unique` ON `books` (`isbn13`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `library_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`status` text NOT NULL,
	`rating` integer,
	`review` text,
	`started_at` text,
	`finished_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "library_items_rating_range_chk" CHECK(rating IS NULL OR (rating BETWEEN 1 AND 5))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `library_items_status_idx` ON `library_items` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `library_items_book_id_idx` ON `library_items` (`book_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `reading_list_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`list_id` integer NOT NULL,
	`library_item_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `reading_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`library_item_id`) REFERENCES `library_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `reading_list_items_unique` ON `reading_list_items` (`list_id`,`library_item_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `reading_list_items_list_id_idx` ON `reading_list_items` (`list_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `reading_list_items_library_item_id_idx` ON `reading_list_items` (`library_item_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `reading_lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `reading_lists_updated_at_idx` ON `reading_lists` (`updated_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `recent_searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`query` text NOT NULL,
	`lang` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `recent_searches_query_lang_unique` ON `recent_searches` (`query`,`lang`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `recent_searches_updated_at_idx` ON `recent_searches` (`updated_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`search_lang` text NOT NULL,
	`theme_mode` text NOT NULL,
	`show_covers` integer NOT NULL,
	`compact_mode` integer NOT NULL,
	`updated_at` text NOT NULL
);

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_library_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`status` text NOT NULL,
	`rating` real,
	`review` text,
	`started_at` text,
	`finished_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "library_items_rating_range_chk" CHECK(rating IS NULL OR (rating BETWEEN 0.5 AND 5)),
	CONSTRAINT "library_items_rating_step_chk" CHECK(rating IS NULL OR abs(rating * 2 - round(rating * 2)) < 0.000001)
);
--> statement-breakpoint
INSERT INTO `__new_library_items`("id", "book_id", "status", "rating", "review", "started_at", "finished_at", "created_at", "updated_at") SELECT "id", "book_id", "status", "rating", "review", "started_at", "finished_at", "created_at", "updated_at" FROM `library_items`;--> statement-breakpoint
DROP TABLE `library_items`;--> statement-breakpoint
ALTER TABLE `__new_library_items` RENAME TO `library_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `library_items_status_idx` ON `library_items` (`status`);--> statement-breakpoint
CREATE INDEX `library_items_book_id_idx` ON `library_items` (`book_id`);
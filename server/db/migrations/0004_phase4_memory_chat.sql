CREATE TABLE `memory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`session_id` text,
	`source` text NOT NULL,
	`content` text NOT NULL,
	`metadata_json` text,
	`embedding_json` text,
	`embedding_model` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `memory_items_agent_id_created_at_idx` ON `memory_items` (`agent_id`, `created_at`);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_message_at` text
);
--> statement-breakpoint
CREATE INDEX `conversations_agent_id_updated_at_idx` ON `conversations` (`agent_id`, `updated_at`);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`metadata_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_messages_conversation_id_created_at_idx` ON `chat_messages` (`conversation_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `chat_messages_agent_id_created_at_idx` ON `chat_messages` (`agent_id`, `created_at`);
--> statement-breakpoint
CREATE TABLE `memory_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`agent_id` text,
	`item_count` integer NOT NULL,
	`blob_json` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `memory_snapshots_agent_id_created_at_idx` ON `memory_snapshots` (`agent_id`, `created_at`);

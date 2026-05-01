CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`acknowledged` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);

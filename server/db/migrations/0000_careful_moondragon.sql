CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`metadata_json` text,
	`created_at` text NOT NULL
);

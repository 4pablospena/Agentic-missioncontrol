CREATE TABLE `tasks_new` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`priority` text NOT NULL,
	`agent_id` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`input_json` text,
	`result_json` text,
	`error` text,
	`scheduled_at` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `tasks_new` (
	`id`,
	`title`,
	`description`,
	`status`,
	`priority`,
	`agent_id`,
	`progress`,
	`input_json`,
	`result_json`,
	`error`,
	`scheduled_at`,
	`started_at`,
	`completed_at`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	COALESCE(json_extract(`payload_json`, '$.title'), 'Migrated task'),
	json_extract(`payload_json`, '$.description'),
	`status`,
	CASE COALESCE(json_extract(`payload_json`, '$.priority'), 'normal')
		WHEN 'low' THEN 'low'
		WHEN 'high' THEN 'high'
		WHEN 'critical' THEN 'critical'
		ELSE 'normal'
	END,
	`agent_id`,
	0,
	`payload_json`,
	NULL,
	NULL,
	NULL,
	NULL,
	NULL,
	`created_at`,
	`created_at`
FROM `tasks`;
--> statement-breakpoint
DROP TABLE `tasks`;
--> statement-breakpoint
ALTER TABLE `tasks_new` RENAME TO `tasks`;
--> statement-breakpoint
CREATE TABLE `task_events` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`type` text NOT NULL,
	`payload_json` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`task_template_json` text NOT NULL,
	`cron_expression` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`next_run_at` text,
	`last_run_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);

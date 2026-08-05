CREATE TYPE "public"."log_direction" AS ENUM('incoming', 'outgoing');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('success', 'failed', 'ignored');--> statement-breakpoint
CREATE TABLE "bot_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sender_number" varchar(20) NOT NULL,
	"sender_name" varchar(100),
	"message_text" text NOT NULL,
	"direction" "log_direction" NOT NULL,
	"module_used" varchar(50),
	"status" "log_status" DEFAULT 'success' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bot_activity_logs" ADD CONSTRAINT "bot_activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
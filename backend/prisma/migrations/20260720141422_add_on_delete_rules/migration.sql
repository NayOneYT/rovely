/*
  Warnings:

  - The primary key for the `flow_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `message_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `message_views` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `flow_members` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `message_reactions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `message_views` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "account_black_lists" DROP CONSTRAINT "account_black_lists_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "account_black_lists" DROP CONSTRAINT "account_black_lists_blocker_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_members" DROP CONSTRAINT "chat_members_account_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_members" DROP CONSTRAINT "chat_members_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "flow_members" DROP CONSTRAINT "flow_members_flow_id_fkey";

-- DropForeignKey
ALTER TABLE "flow_members" DROP CONSTRAINT "flow_members_member_id_fkey";

-- DropForeignKey
ALTER TABLE "flows" DROP CONSTRAINT "flows_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_custom_avatars" DROP CONSTRAINT "friend_custom_avatars_from_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_custom_avatars" DROP CONSTRAINT "friend_custom_avatars_to_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_requests" DROP CONSTRAINT "friend_requests_from_id_fkey";

-- DropForeignKey
ALTER TABLE "friend_requests" DROP CONSTRAINT "friend_requests_to_id_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_account_1_id_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_account_2_id_fkey";

-- DropForeignKey
ALTER TABLE "login_with_phone_requests" DROP CONSTRAINT "login_with_phone_requests_phone_fkey";

-- DropForeignKey
ALTER TABLE "marked_messages" DROP CONSTRAINT "marked_messages_marked_by_fkey";

-- DropForeignKey
ALTER TABLE "marked_messages" DROP CONSTRAINT "marked_messages_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_reaction_id_fkey";

-- DropForeignKey
ALTER TABLE "message_replies" DROP CONSTRAINT "message_replies_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_replies" DROP CONSTRAINT "message_replies_reply_to_fkey";

-- DropForeignKey
ALTER TABLE "message_views" DROP CONSTRAINT "message_views_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_views" DROP CONSTRAINT "message_views_viewer_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "password_recovery_requests" DROP CONSTRAINT "password_recovery_requests_account_id_fkey";

-- DropForeignKey
ALTER TABLE "pinned_group_messages" DROP CONSTRAINT "pinned_group_messages_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "pinned_group_messages" DROP CONSTRAINT "pinned_group_messages_message_id_fkey";

-- DropForeignKey
ALTER TABLE "pinned_group_messages" DROP CONSTRAINT "pinned_group_messages_pinned_by_fkey";

-- DropForeignKey
ALTER TABLE "profile_music" DROP CONSTRAINT "profile_music_account_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_photos" DROP CONSTRAINT "profile_photos_account_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_account_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friend_custom_names" DROP CONSTRAINT "user_friend_custom_names_from_id_fkey";

-- DropForeignKey
ALTER TABLE "user_friend_custom_names" DROP CONSTRAINT "user_friend_custom_names_to_id_fkey";

-- DropIndex
DROP INDEX "messages_chat_id_idx";

-- AlterTable
ALTER TABLE "flow_members" DROP CONSTRAINT "flow_members_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "member_id" DROP NOT NULL,
ADD CONSTRAINT "flow_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "flows" ALTER COLUMN "owner_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "message_reactions" DROP CONSTRAINT "message_reactions_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "actor_id" DROP NOT NULL,
ADD CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "message_views" DROP CONSTRAINT "message_views_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "viewer_id" DROP NOT NULL,
ADD CONSTRAINT "message_views_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "pinned_group_messages" ALTER COLUMN "pinned_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "reporter_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "message_reactions_message_id_idx" ON "message_reactions"("message_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_created_at_idx" ON "messages"("chat_id", "created_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_music" ADD CONSTRAINT "profile_music_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_account_1_id_fkey" FOREIGN KEY ("account_1_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_account_2_id_fkey" FOREIGN KEY ("account_2_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friend_custom_names" ADD CONSTRAINT "user_friend_custom_names_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friend_custom_names" ADD CONSTRAINT "user_friend_custom_names_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_custom_avatars" ADD CONSTRAINT "friend_custom_avatars_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_custom_avatars" ADD CONSTRAINT "friend_custom_avatars_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_black_lists" ADD CONSTRAINT "account_black_lists_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_black_lists" ADD CONSTRAINT "account_black_lists_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marked_messages" ADD CONSTRAINT "marked_messages_marked_by_fkey" FOREIGN KEY ("marked_by") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marked_messages" ADD CONSTRAINT "marked_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_pinned_by_fkey" FOREIGN KEY ("pinned_by") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_views" ADD CONSTRAINT "message_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_views" ADD CONSTRAINT "message_views_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_reply_to_fkey" FOREIGN KEY ("reply_to") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_reaction_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "reactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flows" ADD CONSTRAINT "flows_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_members" ADD CONSTRAINT "flow_members_flow_id_fkey" FOREIGN KEY ("flow_id") REFERENCES "flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_members" ADD CONSTRAINT "flow_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_with_phone_requests" ADD CONSTRAINT "login_with_phone_requests_phone_fkey" FOREIGN KEY ("phone") REFERENCES "accounts"("phone") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_recovery_requests" ADD CONSTRAINT "password_recovery_requests_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

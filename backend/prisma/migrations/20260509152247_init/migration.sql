-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('USER', 'MODERATOR', 'OWNER');

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('PRIVATE', 'GROUP');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER', 'MUTED');

-- CreateEnum
CREATE TYPE "ContentBlockEntityType" AS ENUM ('POST', 'MESSAGE', 'COMMENT');

-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('TEXT', 'VOICE', 'CIRCLE_VIDEO', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'SHARED_POST', 'SHARED_MESSAGE', 'SHARED_COMMENT', 'SHARED_PHOTO');

-- CreateEnum
CREATE TYPE "FlowType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "FlowMemberRole" AS ENUM ('OWNER', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "PostCreatorType" AS ENUM ('USER', 'FLOW');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LikeEntityType" AS ENUM ('POST', 'COMMENT', 'PHOTO');

-- CreateEnum
CREATE TYPE "CommentCreatorType" AS ENUM ('USER', 'FLOW');

-- CreateEnum
CREATE TYPE "CommentEntityType" AS ENUM ('POST', 'COMMENT', 'PHOTO');

-- CreateEnum
CREATE TYPE "NotificationSenderType" AS ENUM ('USER', 'FLOW', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'SHARE', 'REPLY_TO_COMMENT', 'FOLLOW', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FLOW_INVITE', 'FLOW_JOIN');

-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM ('POST', 'COMMENT', 'PHOTO');

-- CreateEnum
CREATE TYPE "ReportEntityType" AS ENUM ('USER', 'FLOW', 'POST', 'PHOTO', 'COMMENT');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('REASONS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportModerationAction" AS ENUM ('ACTIONS');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "role" "AccountRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "account_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "social_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_seen" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "profile_music" (
    "account_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "profile_music_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "profile_photos" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);

-- CreateTable
CREATE TABLE "friend_requests" (
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("to_id","from_id")
);

-- CreateTable
CREATE TABLE "friends" (
    "account_1_id" TEXT NOT NULL,
    "account_2_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("account_1_id","account_2_id")
);

-- CreateTable
CREATE TABLE "user_friend_custom_names" (
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "custom_name" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_friend_custom_names_pkey" PRIMARY KEY ("from_id","to_id")
);

-- CreateTable
CREATE TABLE "friend_custom_avatars" (
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "custom_avatar_url" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "friend_custom_avatars_pkey" PRIMARY KEY ("from_id","to_id")
);

-- CreateTable
CREATE TABLE "account_black_lists" (
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_black_lists_pkey" PRIMARY KEY ("blocker_id","blocked_id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "type" "ChatType" NOT NULL DEFAULT 'PRIVATE',
    "title" TEXT,
    "last_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "chat_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL DEFAULT 'MEMBER',
    "last_read_message_id" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("chat_id","account_id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "entity_type" "ContentBlockEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT,
    "url" TEXT,
    "meta" JSONB,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "is_system_message" BOOLEAN NOT NULL DEFAULT false,
    "sender_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marked_messages" (
    "marked_by" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "marked_messages_pkey" PRIMARY KEY ("marked_by","message_id")
);

-- CreateTable
CREATE TABLE "pinned_group_messages" (
    "pinned_by" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_group_messages_pkey" PRIMARY KEY ("chat_id","message_id")
);

-- CreateTable
CREATE TABLE "message_views" (
    "viewer_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_views_pkey" PRIMARY KEY ("viewer_id","message_id")
);

-- CreateTable
CREATE TABLE "message_replies" (
    "message_id" TEXT NOT NULL,
    "reply_to" TEXT NOT NULL,

    CONSTRAINT "message_replies_pkey" PRIMARY KEY ("message_id","reply_to")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "message_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "reaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("message_id","actor_id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flows" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "flowname" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "social_verified" BOOLEAN NOT NULL DEFAULT false,
    "type" "FlowType" NOT NULL DEFAULT 'PUBLIC',
    "member_count" INTEGER NOT NULL DEFAULT 1,
    "pulse_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flow_members" (
    "flow_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "role" "FlowMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muted_until" TIMESTAMP(3),
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "banned_by" TEXT,
    "is_subscribed_to_notifications" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "flow_members_pkey" PRIMARY KEY ("flow_id","member_id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "creator_type" "PostCreatorType" NOT NULL,
    "creator_id" TEXT NOT NULL,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "actor_id" TEXT NOT NULL,
    "entity_type" "LikeEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("actor_id","entity_type","entity_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "creator_type" "CommentCreatorType" NOT NULL DEFAULT 'USER',
    "creator_id" TEXT NOT NULL,
    "entity_type" "CommentEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reply_to_comment_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "sender_type" "NotificationSenderType" NOT NULL,
    "sender_id" TEXT,
    "type" "NotificationType",
    "entity_type" "NotificationEntityType",
    "entity_id" TEXT,
    "meta" JSONB NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "entity_type" "ReportEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "moderation_action" "ReportModerationAction",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handled_by" TEXT,
    "handled_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_number_key" ON "accounts"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_login_key" ON "accounts"("login");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE INDEX "friend_requests_from_id_idx" ON "friend_requests"("from_id");

-- CreateIndex
CREATE INDEX "friends_account_2_id_idx" ON "friends"("account_2_id");

-- CreateIndex
CREATE INDEX "account_black_lists_blocked_id_idx" ON "account_black_lists"("blocked_id");

-- CreateIndex
CREATE INDEX "chat_members_account_id_idx" ON "chat_members"("account_id");

-- CreateIndex
CREATE INDEX "content_blocks_entity_type_entity_id_idx" ON "content_blocks"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_idx" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "message_views_message_id_idx" ON "message_views"("message_id");

-- CreateIndex
CREATE INDEX "message_replies_reply_to_idx" ON "message_replies"("reply_to");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_emoji_key" ON "reactions"("emoji");

-- CreateIndex
CREATE UNIQUE INDEX "flows_flowname_key" ON "flows"("flowname");

-- CreateIndex
CREATE INDEX "flow_members_member_id_idx" ON "flow_members"("member_id");

-- CreateIndex
CREATE INDEX "posts_creator_type_creator_id_created_at_idx" ON "posts"("creator_type", "creator_id", "created_at");

-- CreateIndex
CREATE INDEX "likes_entity_id_idx" ON "likes"("entity_id");

-- CreateIndex
CREATE INDEX "comments_creator_type_creator_id_idx" ON "comments"("creator_type", "creator_id");

-- CreateIndex
CREATE INDEX "comments_entity_type_entity_id_idx" ON "comments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_entity_type_entity_id_idx" ON "reports"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_music" ADD CONSTRAINT "profile_music_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_account_1_id_fkey" FOREIGN KEY ("account_1_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_account_2_id_fkey" FOREIGN KEY ("account_2_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friend_custom_names" ADD CONSTRAINT "user_friend_custom_names_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_friend_custom_names" ADD CONSTRAINT "user_friend_custom_names_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_custom_avatars" ADD CONSTRAINT "friend_custom_avatars_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_custom_avatars" ADD CONSTRAINT "friend_custom_avatars_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_black_lists" ADD CONSTRAINT "account_black_lists_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_black_lists" ADD CONSTRAINT "account_black_lists_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marked_messages" ADD CONSTRAINT "marked_messages_marked_by_fkey" FOREIGN KEY ("marked_by") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marked_messages" ADD CONSTRAINT "marked_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_pinned_by_fkey" FOREIGN KEY ("pinned_by") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_group_messages" ADD CONSTRAINT "pinned_group_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_views" ADD CONSTRAINT "message_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_views" ADD CONSTRAINT "message_views_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_replies" ADD CONSTRAINT "message_replies_reply_to_fkey" FOREIGN KEY ("reply_to") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_reaction_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "reactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flows" ADD CONSTRAINT "flows_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_members" ADD CONSTRAINT "flow_members_flow_id_fkey" FOREIGN KEY ("flow_id") REFERENCES "flows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_members" ADD CONSTRAINT "flow_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_members" ADD CONSTRAINT "flow_members_banned_by_fkey" FOREIGN KEY ("banned_by") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_reply_to_comment_id_fkey" FOREIGN KEY ("reply_to_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

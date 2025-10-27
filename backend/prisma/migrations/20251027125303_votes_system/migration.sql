/*
  Warnings:

  - You are about to drop the `likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."likes" DROP CONSTRAINT "likes_userId_fkey";

-- DropTable
DROP TABLE "public"."likes";

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_postId_key" ON "votes"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_commentId_key" ON "votes"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

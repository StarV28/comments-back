/*
  Warnings:

  - You are about to drop the column `text` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `content` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Comment` DROP COLUMN `text`,
    ADD COLUMN `content` TEXT NOT NULL;

-- RenameIndex
ALTER TABLE `Comment` RENAME INDEX `Comment_userId_fkey` TO `Comment_userId_idx`;

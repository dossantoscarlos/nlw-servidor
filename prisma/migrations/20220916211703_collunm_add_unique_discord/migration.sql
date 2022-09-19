/*
  Warnings:

  - A unique constraint covering the columns `[discord]` on the table `ads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ads_discord_key" ON "ads"("discord");

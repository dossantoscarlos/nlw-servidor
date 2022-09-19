import express from "express";
import { PrismaClient } from "@prisma/client";

import { ConvertHoursForMinutes } from "./util/convert-hours-for-minutes";
import { ConvertMinutesForHours } from "./util/convert-minutes-for-hours";
import cors from "cors";

const app = express();

const prisma = new PrismaClient({
	log: ["query"],
});

app.use(express.json());
app.use(cors());

app.get("/games", async (req, resp, next) => {
	const games = await prisma.game.findMany({
		include: {
			_count: {
				select: {
					ads: true,
				},
			},
		},
	});
	return resp.json(games);
});

app.post("/game/:id/ads", async (req, resp, next) => {
	const gameId: string = req.params.id;
	const body = req.body;

	const ad = await prisma.ad.create({
		data: {
			name: body.name,
			discord: body.discord,
			useVoiceChannel: body.useVoiceChannel,
			yearsPlaying: +body.yearsPlaying,
			weekDays: body.weekDays.toString(),
			hourStart: ConvertHoursForMinutes(body.hourStart.toString()),
			hourEnd: ConvertHoursForMinutes(body.hourEnd.toString()),
			gameId,
		},
	});

	return resp.status(201).json({
		Ads: ad,
	});
});

app.get("/games/:id/ads", async (req, resp, next) => {
	const gameId = req.params.id;
	const ad = await prisma.ad.findMany({
		select: {
			id: true,
			name: true,
			yearsPlaying: true,
			weekDays: true,
			hourStart: true,
			hourEnd: true,
			useVoiceChannel: true,
		},
		where: {
			gameId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	if (ad === null) {
		return resp.status(404).json({
			message: "Not Found",
		});
	}

	return resp.json(
		ad.map((ad) => {
			return {
				...ad,
				weekDays: ad.weekDays.split(","),
				hourStart: ConvertMinutesForHours(ad.hourStart),
				hourEnd: ConvertMinutesForHours(ad.hourEnd),
			};
		})
	);
});

app.get("/ads/:id/discord", async (req, resp, next) => {
	const id = req.params.id;
	const ad = await prisma.ad.findUnique({
		select: {
			discord: true,
		},
		where: {
			id,
		},
	});

	if (ad === null) {
		return resp.status(404).json({
			message: "Not Found",
		});
	}

	return resp.json({
		discord: ad.discord,
	});
});

app.listen(3333);

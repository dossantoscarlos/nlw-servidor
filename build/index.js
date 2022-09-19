var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.get("/games", (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const games = yield prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    });
    return resp.json(games);
}));
app.post("/game/:id/ads", (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.id;
    const body = req.body;
    const ad = yield prisma.ad.create({
        data: Object.assign(Object.assign({}, body), { yearsPlaying: +body.yearsPlaying, weekDays: body.weekDays.toString(), hourStart: ConvertHoursForMinutes(body.hourStart.toString()), hourEnd: ConvertHoursForMinutes(body.hourEnd.toString()), gameId }),
    });
    return resp.status(201).json({
        Ads: ad,
    });
}));
app.get("/games/:id/ads", (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.id;
    const ad = yield prisma.ad.findMany({
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
    return resp.json(ad.map((ad) => {
        return Object.assign(Object.assign({}, ad), { weekDays: ad.weekDays.split(","), hourStart: ConvertMinutesForHours(ad.hourStart), hourEnd: ConvertMinutesForHours(ad.hourEnd) });
    }));
}));
app.get("/ads/:id/discord", (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const ad = yield prisma.ad.findUnique({
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
}));
app.listen(3333);

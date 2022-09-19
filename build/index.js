"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const convert_hours_for_minutes_1 = require("./util/convert-hours-for-minutes");
const convert_minutes_for_hours_1 = require("./util/convert-minutes-for-hours");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient({
    log: ["query"],
});
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
        data: {
            name: body.name,
            discord: body.discord,
            useVoiceChannel: body.useVoiceChannel,
            yearsPlaying: +body.yearsPlaying,
            weekDays: body.weekDays.toString(),
            hourStart: (0, convert_hours_for_minutes_1.ConvertHoursForMinutes)(body.hourStart.toString()),
            hourEnd: (0, convert_hours_for_minutes_1.ConvertHoursForMinutes)(body.hourEnd.toString()),
            gameId,
        },
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
    return resp.json(ad.map((arr) => {
        return {
            name: arr.name,
            useVoiceChannel: arr.useVoiceChannel,
            yearsPlaying: arr.yearsPlaying,
            weekDays: arr.weekDays.split(","),
            hourStart: (0, convert_minutes_for_hours_1.ConvertMinutesForHours)(arr.hourStart),
            hourEnd: (0, convert_minutes_for_hours_1.ConvertMinutesForHours)(arr.hourEnd),
        };
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.info("Servidor iniciou com sucesso!!!");
});

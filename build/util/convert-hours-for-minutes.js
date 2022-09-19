"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertHoursForMinutes = void 0;
function ConvertHoursForMinutes(hourString) {
    const [hours, minutes] = hourString.split(":").map(Number);
    const minutesAmount = hours * 60 + minutes;
    return minutesAmount;
}
exports.ConvertHoursForMinutes = ConvertHoursForMinutes;

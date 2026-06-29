import mongoose from "mongoose";

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const inMemoryProgress = new Map();
export const inMemoryActivities = [];
export const inMemoryGameSessions = new Map(); // gameId -> [sessions]

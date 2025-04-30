"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const stream_1 = require("./sockets/stream");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "https://remarkable-sprite-61a401.netlify.app",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "https://remarkable-sprite-61a401.netlify.app",
    credentials: true
}));
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});
app.get("/", (req, res) => {
    res.send("Server is running.");
});
const stream = io.of(process.env.SOCKET_NAMESPACE || '/stream');
(0, stream_1.registerStreamNamespace)(stream);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

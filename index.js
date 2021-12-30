const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();
const corsOption = {
  wildcard: "*",
  origin: process.env.CLIENT_URL,
  credential: true,
  allowedHeaders: ["Authorization", "sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
};
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
  })
);
app.use(cookieParser());

require("dotenv").config({ path: "./config/.env" });
require("./config/db");
require("./config/cloudinary");
const isAuthenticated = require("./api/middleware/isAuthenticated");

// Messenger
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const articlesRoutes = require("./api/routes/articles");
app.use("/api/post", articlesRoutes);
const authentificationRoutes = require("./api/routes/auth");
app.use("/api", authentificationRoutes);
const friendsRoutes = require("./api/routes/friends");
app.use("/api/friends", friendsRoutes);
const usersRoutes = require("./api/routes/users");
app.use("/api/user", usersRoutes);

app.get("/", isAuthenticated, (req, res) => {
  res.status(200).json("Welcome to Family-network API !");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

app.all("/api/*", isAuthenticated, (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port : ${process.env.PORT}`);
});

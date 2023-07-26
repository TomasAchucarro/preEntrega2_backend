import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { PORT, __dirname, MONGO_DB_NAME, MONGO_URI } from "./utils.js";
import { messageModel } from "./dao/models/message.model.js";
import productsRouter from "./routers/products.router.js";
import cartsRouter from "./routers/carts.router.js";
import viewsProductsRouter from "./routers/views.router.js";
import helmet from "helmet";

const app = express();
app.use(express.json());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "http://localhost:8080"],
      scriptSrc: ["'self'", "http://localhost:8080", "https://cdn.jsdelivr.net/"],
      styleSrc: ["'self'", "http://localhost:8080", "https://cdn.jsdelivr.net/", "'unsafe-inline'"],
      fontSrc: ["'self'", "http://localhost:8080"],
    },
  })
);


try {
  await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
  const serverHttp = app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
  );
  const io = new Server(serverHttp);
  app.set("socketio", io);

  app.use(express.static(`${__dirname}/public`));
  app.engine("handlebars", handlebars.engine());
  app.set("views", `${__dirname}/views`);
  app.set("view engine", "handlebars");

  app.get("/", (req, res) => res.render("index", { name: "Coder" }));
  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartsRouter);
  app.use("/products", viewsProductsRouter);

  io.on("connection", async (socket) => {
    socket.on("productList", (data) => {
      console.log(data);
      io.emit("updatedProducts", data);
    });
    socket.on("cartList", (data) => {
      io.emit("updatedCarts", data);
    });

    let messages = (await messageModel.find()) ? await messageModel.find() : [];

    socket.broadcast.emit("alerta");
    socket.emit("logs", messages);
    socket.on("message", (data) => {
      messages.push(data);
      messageModel.create(messages);
      io.emit("logs", messages);
    });
  });
} catch (error) {
  console.log(`Cannot connect to dataBase: ${error}`);
  process.exit();
}

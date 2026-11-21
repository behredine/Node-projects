import fastify from "fastify";
import menuItems from "./data/menuItems.js";
import operatingHours from "./data/operatingHours.js";
import ejs from "ejs";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import { join } from "path";

const app = fastify();
const port = 3000;
const publicpath = join(process.cwd(), "public");

// to use ejs (server side templating language you have to install fastify/view plug in )
//  and register the plug in and the templating language as an engine
app.register(fastifyView, {
  engine: {
    ejs: ejs,
  },
});

app.register(fastifyStatic, {
  root: publicpath,
  prefix: "/public/",
});

// routes
app.get("/", async (req, reply) => {
  return reply.view("./views/index.ejs", { name: "What is Fare is Fair" });
});

app.get("/menu", async (req, reply) => {
  return reply.view("./views/menu.ejs", { menuItems });
});

app.get("/hours", async (req, reply) => {
  return reply.view("./views/hours.ejs", {
    days: [
      "monday",
      "tuesday",
      "wendsday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    operatingHours,
  });
});

await app.listen({ port }, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`The server is running at port ${port} .`);
});

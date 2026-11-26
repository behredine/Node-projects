import fastify from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyView from "@fastify/view";
import handlebars from "handlebars";

const PORT = 3000;
const app = fastify();

await app.register(fastifyFormbody);
await app.register(fastifyView, {
  engine: {
    handlebars,
  },
  root: "views",
});

app.get("/", (request, reply) => {
  reply.send("Welcome dude!");
});

await app.listen({ port: PORT }, async (error, address) => {
  if (error) {
    console.error("error occurred: ", error);
    process.exit(1);
  }
  console.log(`The app is running at port ${PORT}.`);
});

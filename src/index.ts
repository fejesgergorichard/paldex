import { staticPlugin } from "@elysiajs/static";
import {cors} from '@elysiajs/cors'
import { Elysia } from "elysia";
import { pals, passives } from "./services/jsonDataService";

const app = new Elysia()
  .use(staticPlugin())
  // .use(cors({
  //   origin: ['*'], // Allow all origins
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  //   maxAge: 600 // Set the cache duration
  // }))
  .use(cors())
  .get(
    "/pals/",
    () => pals
  )
  .get(
    "/passives/",
    () => passives
  )
  .listen(3000);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);

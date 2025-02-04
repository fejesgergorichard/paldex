import { staticPlugin } from "@elysiajs/static";
import {cors} from '@elysiajs/cors'
import { Elysia } from "elysia";
import { queryListPals } from "./schemas";
import { ListPalsUseCase } from "./useCases";

const app = new Elysia()
  .use(staticPlugin())
  // .use(cors({
  //   origin: ['*'], // Allow all origins
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  //   maxAge: 600 // Set the cache duration
  // }))
  .use(cors())
  .get(
    "/",
    ({ query: { page, limit, term, ...filter } }) =>
      ListPalsUseCase.execute({ page, limit, term, filter }),
    {
      query: queryListPals,
    }
  )
  .listen(3000);

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);

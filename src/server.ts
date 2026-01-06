import app from "./index";

app.listen(3000);

console.log(`🦊 Elysia is running at http://localhost:${app.server?.port}`);
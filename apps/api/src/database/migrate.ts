// import { migrate } from "drizzle-orm/mysql2/migrator";
// import { connection, db } from "./client";

// const runner = async () => {
//   await db.transaction(async (tx) => {
//     await migrate(tx, {
//       migrationsFolder:
//         process.env.NODE_ENV === "development"
//           ? "src/database/migrations"
//           : "apps/api/src/database/migrations",
//     });
//   });

//   if (process.env.NODE_ENV === "development") {
//     console.log("Migration complete");
//     connection.end();
//   }
// };

// export const handler = async () => {
//   await runner();

//   return {
//     statusCode: 200,
//     body: "Migration started",
//   };
// };

// if (process.env.NODE_ENV === "development") {
//   (async () => {
//     await runner();
//   })();
// }

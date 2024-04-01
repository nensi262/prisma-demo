// import { drizzle } from "drizzle-orm/mysql2";
// import { chunk, simpleChunk } from "./chunker";

// import { eq, sql } from "drizzle-orm";
// import { db } from "home/src/database/client";
// import { propertyTransactionHistory } from "home/src/database/schema";
// import { createPool } from "mysql2";
// import { z } from "zod";

// const entrySchema = z.object({
//   tuid: z.string(),
//   city: z.string(),
// });

// const ppdConnection = createPool();
// const ppdDb = drizzle(ppdConnection);
// const EST_TOTAL_RECORDS = 28835503;
// let processed = 0;

// export const handler = async () => {
//   await chunk(1000, async ({ cursor, setActive, setCursor, limit }) => {
//     const data = await ppdDb
//       .select({
//         tuid: sql`tuid`,
//         price: sql`price`,
//         date: sql`date`,
//         postcode: sql`postcode`,
//         type: sql`type`,
//         newBuild: sql`newbuild`,
//         tenure: sql`tenure`,
//         paon: sql`paon`,
//         saon: sql`saon`,
//         street: sql`street`,
//         city: sql`a`,
//       })
//       .from(sql`ppd`)
//       .orderBy(sql`tuid`)
//       .where(sql`tuid > ${cursor}`)
//       .limit(limit);

//     if (data.length === 0) {
//       setActive(false);
//       return;
//     }

//     setCursor(data[data.length - 1]?.tuid as string);

//     const body = await z.array(entrySchema).parseAsync(data);

//     await simpleChunk(body, 5, async (chunk) => {
//       await Promise.all(
//         chunk.map(async (entry) => {
//           console.log(
//             "processed",
//             processed++,
//             "of",
//             EST_TOTAL_RECORDS,
//             entry.tuid,
//           );

//           await db
//             .update(propertyTransactionHistory)
//             .set({
//               city: entry.city,
//             })
//             .where(eq(propertyTransactionHistory.tuid, entry.tuid));
//         }),
//       );
//     });
//   });
// };

// handler();

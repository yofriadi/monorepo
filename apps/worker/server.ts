import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ElysiaAdapter } from "@bull-board/elysia";
import Elysia from "elysia";
import { Queue } from "bullmq";
import { connection, LISTING_QUEUE, DETAIL_QUEUE } from "./config/queue";

const listingQueue = new Queue(LISTING_QUEUE, { connection });
const detailQueue = new Queue(DETAIL_QUEUE, { connection });

const serverAdapter = new ElysiaAdapter('/bullmq');
createBullBoard({
  queues: [new BullMQAdapter(listingQueue), new BullMQAdapter(detailQueue)],
  serverAdapter,
});

const app = new Elysia()
  .onError(({ error, code, request }) => {
    console.error(error, code, request.method, request.url);
    if (code === 'NOT_FOUND') return 'NOT_FOUND';
  })
  .use(serverAdapter.registerPlugin())

app.listen(3002, ({ port, url }) => {
  console.log(`Running on ${url.hostname}:${port}...`);
  console.log(`For the UI open http://localhost:${port}/bullmq`);
  console.log('Make sure Redis is running on port 6379 by default');
});

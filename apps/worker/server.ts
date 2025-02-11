import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import express from "express";
import { Queue } from "bullmq";
import { connection, LISTING_QUEUE, DETAIL_QUEUE } from "./config/queue";

const app = express();
const listingQueue = new Queue(LISTING_QUEUE, { connection });
const detailQueue = new Queue(DETAIL_QUEUE, { connection });

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(listingQueue), new BullMQAdapter(detailQueue)],
  serverAdapter,
});

serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3002, () => {
  console.log("Bull Board running on port 3002");
});

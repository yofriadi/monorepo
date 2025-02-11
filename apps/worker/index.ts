import { sql, eq, and } from "drizzle-orm";

import './worker/listing';
import './worker/detail';
import "./server";

import { db, client } from "@workspace/db";
import { messageQueue } from "@workspace/db/drizzle/schema";
import { defaultJobOptions } from "./config/queue";
import { listingQueue } from "./worker/listing";

await client.connect();
await client.query('LISTEN message_events');

client.on('notification', async (msg) => {
  console.info(`Received notification: ${msg.payload}`);
  const [topic, _] = msg.payload.split(':');
  if (topic === 'scraping') {
    await processMessages()
  }
});

client.on('error', (err) => {
  console.error('Listener error:', err);
  process.exit(1);
});

async function processMessages() {
  try {
    let processedCount = 0;
    let message;
    
    do {
      message = await processNextMessage();
      if (!message) break;

      try {
        console.info(`Processing message ${message.id}`);
        await listingQueue.add("listing", message.payload, defaultJobOptions);
        await db.update(messageQueue)
          .set({ status: 'completed' })
          .where(eq(messageQueue.id, message.id));
        processedCount++;
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        await db.update(messageQueue)
          .set({
            status: message.retries >= 3 ? 'failed' : 'queued',
            retries: message.retries + 1,
          })
          .where(eq(messageQueue.id, message.id));
      }
    } while (message);

    console.info(`Processed ${processedCount} messages`);
  } catch (error) {
    console.error('Error in message processing:', error);
  }
}

async function processNextMessage() {
  return db.transaction(async (tx) => {
    const [message] = await tx
      .select()
      .from(messageQueue)
      .where(
        and(
          eq(messageQueue.status, 'pending'),
          sql`${messageQueue.createdAt} < NOW() - INTERVAL '5 seconds' * ${messageQueue.retries}`
        )
      )
      .orderBy(messageQueue.createdAt)
      .limit(1)
      .for('update', { skipLocked: true });
    if (!message) return null;

    await tx.update(messageQueue)
      .set({ status: 'processing' })
      .where(eq(messageQueue.id, message.id));

    return message;
  });
}


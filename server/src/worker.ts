import { Worker } from "bullmq";
import { Pool } from "pg";
import Redis from "ioredis";

const db = new Pool({
	connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dream_fabric",
});

const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
	maxRetriesPerRequest: null,
});

const worker = new Worker(
	"dream-processing",
	async (job) => {
		const { dreamId, rawText } = job.data;
		console.log(`Processing dream ${dreamId}: ${rawText}`);

		try {
			// Update status to processing
			await db.query("UPDATE raw_dreams SET status = 'processing' WHERE id = $1", [dreamId]);

			// Simulate LLM transformation to XML
			// In a real scenario, you'd call OpenAI or another LLM here.
			const xmlFabric = `
<fabric id="${dreamId}">
  <dreamer>
    <content>${rawText}</content>
  </dreamer>
  <weaving>
    <status>completed</status>
    <timestamp>${new Date().toISOString()}</timestamp>
    <interpretation>Your dream reflects a deep connection to the 3-layer architecture.</interpretation>
  </weaving>
</fabric>`.trim();

			// Save the XML fabric
			await db.query("INSERT INTO fabrics (dream_id, xml_content) VALUES ($1, $2)", [dreamId, xmlFabric]);

			// Update status to completed
			await db.query("UPDATE raw_dreams SET status = 'completed' WHERE id = $1", [dreamId]);

			console.log(`Successfully processed dream ${dreamId}`);
		} catch (error) {
			console.error(`Failed to process dream ${dreamId}:`, error);
			await db.query("UPDATE raw_dreams SET status = 'failed' WHERE id = $1", [dreamId]);
			throw error;
		}
	},
	{ connection: redisConnection },
);

console.log("Worker started...");

worker.on("failed", (job, err) => {
	console.error(`${job?.id} has failed with ${err.message}`);
});

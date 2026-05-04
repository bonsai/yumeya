import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Pool } from "pg";
import { Queue } from "bullmq";
import Redis from "ioredis";
import type { ApiResponse } from "shared";

/**
 * PostgreSQL connection pool instance.
 */
const db = new Pool({
	connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dream_fabric",
});

/**
 * Redis connection instance for BullMQ.
 */
const redisConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
	maxRetriesPerRequest: null,
});

/**
 * BullMQ queue for processing dreams asynchronously.
 */
const dreamQueue = new Queue("dream-processing", { connection: redisConnection });

/**
 * Main Hono application instance defining the API routes.
 */
export const app = new Hono()

.use(cors())

.get("/", (c) => {
	return c.text("Hello Hono!");
})

.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
})

.post(
	"/api/dreams",
	zValidator(
		"json",
		z.object({
			userId: z.string(),
			rawText: z.string().min(1),
		}),
	),
	async (c) => {
		const { userId, rawText } = c.req.valid("json");
		try {
			const result = await db.query(
				"INSERT INTO raw_dreams (user_id, raw_text, status) VALUES ($1, $2, $3) RETURNING id",
				[userId, rawText, "queued"],
			);
			const dreamId = result.rows[0].id;

			await dreamQueue.add("process-dream", { dreamId, rawText });

			return c.json({ id: dreamId, status: "queued", success: true }, 202);
		} catch (error) {
			console.error(error);
			return c.json({ message: "Failed to save dream", success: false }, 500);
		}
	},
)

.get("/api/fabric/:id", async (c) => {
	const dreamId = c.req.param("id");
	try {
		const result = await db.query("SELECT xml_content FROM fabrics WHERE dream_id = $1", [dreamId]);
		if (result.rows.length === 0) {
			return c.json({ message: "Fabric not found or still processing", success: false }, 404);
		}
		const xml = result.rows[0].xml_content;
		return c.body(xml, 200, { "Content-Type": "application/xml" });
	} catch (error) {
		console.error(error);
		return c.json({ message: "Error retrieving fabric", success: false }, 500);
	}
})

.get("/api/dreams/:id", async (c) => {
	const dreamId = c.req.param("id");
	try {
		const result = await db.query("SELECT * FROM raw_dreams WHERE id = $1", [dreamId]);
		if (result.rows.length === 0) {
			return c.json({ message: "Dream not found", success: false }, 404);
		}
		return c.json(result.rows[0], 200);
	} catch (error) {
		console.error(error);
		return c.json({ message: "Error retrieving dream", success: false }, 500);
	}
});

export default app;

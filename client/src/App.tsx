import { useState, useEffect } from "react";
import { hcWithType } from "server/client";
import beaver from "./assets/beaver.svg";
import { Button } from "./components/ui/button";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const client = hcWithType(SERVER_URL);

function App() {
	const [dreamText, setDreamText] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [dreamId, setDreamId] = useState<number | null>(null);
	const [xmlFabric, setXmlFabric] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmitDream(e: React.FormEvent) {
		e.preventDefault();
		if (!dreamText.trim()) return;

		setIsSubmitting(true);
		setStatus("Submitting dream...");
		setXmlFabric(null);

		try {
			// @ts-ignore - Hono client types might need regeneration but we know the path
			const res = await client.api.dreams.$post({
				json: {
					userId: "user-1",
					rawText: dreamText,
				},
			});

			if (res.ok) {
				const data = await res.json();
				setDreamId(data.id);
				setStatus("Dream queued for processing...");
			} else {
				setStatus("Failed to submit dream.");
			}
		} catch (error) {
			console.error(error);
			setStatus("Error submitting dream.");
		} finally {
			setIsSubmitting(false);
		}
	}

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;

		if (dreamId && !xmlFabric) {
			interval = setInterval(async () => {
				try {
					// @ts-ignore
					const res = await client.api.dreams[":id"].$get({
						param: { id: dreamId.toString() },
					});

					if (res.ok) {
						const data = await res.json();
						if (data.status === "completed") {
							// @ts-ignore
							const fabricRes = await client.api.fabric[":id"].$get({
								param: { id: dreamId.toString() },
							});
							if (fabricRes.ok) {
								const xml = await fabricRes.text();
								setXmlFabric(xml);
								setStatus("Fabric woven successfully!");
								clearInterval(interval);
							}
						} else if (data.status === "failed") {
							setStatus("Weaving failed.");
							clearInterval(interval);
						} else {
							setStatus(`Status: ${data.status}...`);
						}
					}
				} catch (error) {
					console.error("Error polling status:", error);
				}
			}, 2000);
		}

		return () => clearInterval(interval);
	}, [dreamId, xmlFabric]);

	return (
		<div className="max-w-2xl mx-auto flex flex-col gap-6 items-center justify-center min-h-screen p-4">
			<a
				href="https://github.com/stevedylandev/bhvr"
				target="_blank"
				rel="noopener"
			>
				<img
					src={beaver}
					className="w-16 h-16 cursor-pointer"
					alt="beaver logo"
				/>
			</a>
			<h1 className="text-5xl font-black text-center">Dream Weaver</h1>
			<p className="text-center text-gray-600">
				Submit your dream to be woven into an XML Fabric.
			</p>

			<form onSubmit={handleSubmitDream} className="w-full flex flex-col gap-4">
				<textarea
					className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
					placeholder="Describe your dream here..."
					value={dreamText}
					onChange={(e) => setDreamText(e.target.value)}
					disabled={isSubmitting}
				/>
				<Button type="submit" disabled={isSubmitting || !dreamText.trim()}>
					{isSubmitting ? "Submitting..." : "Weave Dream"}
				</Button>
			</form>

			{status && (
				<div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
					{status}
				</div>
			)}

			{xmlFabric && (
				<div className="w-full mt-4">
					<h3 className="text-xl font-bold mb-2 text-center">Your Woven Fabric (XML)</h3>
					<pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs border border-gray-200 whitespace-pre-wrap">
						<code>{xmlFabric}</code>
					</pre>
				</div>
			)}
		</div>
	);
}

export default App;

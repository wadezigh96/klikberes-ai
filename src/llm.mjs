const DEFAULT_MODEL = process.env.LLM_MODEL || "openai/gpt-oss-20b:free";
const BASE_URL = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";

export async function generatePlanWithLLM(title) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) return null;
  const prompt = `You are a safety-first task planner. Convert the user's request into exactly 5 clear, reviewable steps. Use exactly these IDs in order: understand, prepare, approval, execute, verify. The approval step must say that nothing is submitted before explicit user approval. Never suggest contacting external websites or submitting real data. Keep each step short. Return ONLY a JSON array of 5 objects with keys: id, label, detail.\n\nUser request: "${title}"`;
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://klikberes-ai.vercel.app",
        "X-Title": "KlikBeres AI"
      },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 600 })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) return null;
    const plan = JSON.parse(jsonMatch[0]);
    return Array.isArray(plan) ? plan : null;
  } catch {
    return null;
  }
}

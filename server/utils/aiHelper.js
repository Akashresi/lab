// server/utils/aiHelper.js

// Node 18+ has global fetch, fallback for older versions
let fetchFn;
try {
    fetchFn = fetch;
} catch {
    fetchFn = require("node-fetch");
}

/**
 * ================================
 * HELPER: CALL AI PROVIDER
 * ================================
 */
const callAI = async (prompt) => {
    const apiKey = process.env.AI_API_KEY;

    // ✅ No API key → mock mode
    if (!apiKey) {
        console.warn("⚠️ No AI_API_KEY found. Using mock response.");
        return null;
    }

    // ✅ GOOGLE GEMINI
    if (apiKey.startsWith("AIza")) {
        try {
            const url =
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetchFn(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            const data = await response.json();

            // 🔥 KEY FIX: fallback instead of throwing
            if (!response.ok || data.error) {
                console.warn(
                    "⚠️ Gemini API issue (quota / rate limit / error). Falling back to mock AI."
                );
                return null;
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (err) {
            console.warn("⚠️ Gemini request failed. Using mock AI.");
            return null;
        }
    }

    // Unsupported provider → fallback
    return null;
};

module.exports = { callAI };

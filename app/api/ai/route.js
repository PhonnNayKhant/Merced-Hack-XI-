import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const BASE_SYSTEM_PROMPT = `You are SolShield AI — a friendly assistant inside a Solana USDC wallet app. You help users:
- Understand how to send/receive USDC on Solana Devnet
- Use wallet features (airdrop SOL for gas, check balances, QR codes, copy address)
- Learn basic Solana and crypto concepts in plain language
- Translate anything they ask into any language

Keep answers short (2-4 sentences). Use simple words.`;

export async function POST(request) {
  try {
    const { action, messages, text, targetLang, preferredLang } = await request.json();

    const model = genAI.getGenerativeModel({ model:                                      });

    // ── TRANSLATE UI STRINGS ──
    if (action === "translate") {
      const prompt = `Translate the following JSON values (not keys) into ${targetLang}. Return ONLY valid JSON, no markdown fences, no explanation.\n\n${JSON.stringify(text)}`;
      const result = await model.generateContent(prompt);
      const raw = result.response.text().replace(/```json\n?|```\n?/g, "").trim();
      return NextResponse.json({ translated: JSON.parse(raw) });
    }

    // ── CHAT ──
    const langInstruction =
      preferredLang && preferredLang !== "English"
        ? `Always respond in ${preferredLang}. The user has selected this language for the app.`
        : "If the user writes in a non-English language, respond in that same language. Otherwise respond in English.";
    const systemPrompt = `${BASE_SYSTEM_PROMPT} ${langInstruction}`;

    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Got it! I'm SolShield AI, ready to help." }] },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);

    return NextResponse.json({ reply: result.response.text() });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "AI request failed." }, { status: 500 });
  }
}
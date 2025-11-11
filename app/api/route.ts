import { contextPrompt } from "@/config/prompts/music";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { message } = await req.json();
    const url = process.env.OLLAMA_MODEL_URL as string;
    const controller = new AbortController();
    const decoder = new TextDecoder();

    try {
        const response = await fetch(`${url}/api/generate`, {
            signal: controller.signal,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: `${contextPrompt}\nUser: ${message}`,
                stream: true,
            }),
        });

        if (!response.body) {
            return NextResponse.json({ reply: "No se recibió respuesta del modelo." });
        }

        // Timeout de seguridad (por si Ollama no responde)
        const timeout = setTimeout(() => controller.abort(), 60000);

        const stream = new ReadableStream({
            async start(ctrl) {
                try {
                    const reader = response.body!.getReader();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split("\n").filter(Boolean);

                        for (const line of lines) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.response) {
                                    ctrl.enqueue(parsed.response);
                                }
                            } catch (err) {
                                console.warn("Línea inválida del stream:", line);
                            }
                        }
                    }

                    ctrl.close();
                } catch (err) {
                    console.error("❌ Error en el stream:", err);
                    ctrl.enqueue("❌ Error al procesar la respuesta del modelo.");
                    ctrl.close();
                } finally {
                    clearTimeout(timeout);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (err) {
        console.error("Error general al conectar con Ollama:", err);
        return NextResponse.json(
            { reply: "Error al conectar con el modelo IA." },
            { status: 500 }
        );
    }
}

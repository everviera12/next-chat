import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { message } = await req.json();

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt: `Eres un asistente de la empresa Victor's Website. Responde preguntas sobre servicios, precios y experiencia.\nUsuario: ${message}`,
            }),
        });

        if (!response.body) {
            return NextResponse.json({ reply: "No recibí respuesta del modelo." });
        }

        const reader = response.body.getReader();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = new TextDecoder().decode(value);

            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                        fullText += parsed.response;
                    }
                } catch {
                }
            }
        }

        return NextResponse.json({ reply: fullText.trim() || "No tengo información sobre eso." });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ reply: "Error al conectar con el modelo IA." }, { status: 500 });
    }
}

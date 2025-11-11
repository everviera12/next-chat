"use client";

import Link from "next/link";
import { Message } from "@/types";
import { GithubIcon, SendIcon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import React, { useCallback, useState } from "react";
import { Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Form } from "@heroui/form";
import { ScrollShadow } from "@heroui/scroll-shadow";

const ChatMessage = React.memo(({ msg }: { msg: Message }) => (
    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
        <div
            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md 
        ${msg.role === "user" ? "bg-warning text-white" : "bg-gray-700 text-gray-100"}`}
        >
            {msg.content}
        </div>
    </div>
));

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = useCallback(async () => {
        const sanitizedInput = input.replace(/[<>]/g, "");
        if (!sanitizedInput.trim()) return;

        // Mensaje del usuario
        const userMsg: Message = { role: "user", content: sanitizedInput };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: sanitizedInput }), // ✅ CORREGIDO
            });

            if (!res.body) {
                throw new Error("No se recibió respuesta del servidor.");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let partialText = "";
            let assistantMsg: Message = { role: "assistant", content: "" };
            setMessages((prev) => [...prev, assistantMsg]);

            while (true) {
                try {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    if (!chunk) continue; // evita actualizar con texto vacío

                    partialText += chunk;
                    setMessages((prev) => {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: partialText,
                        };
                        return updated;
                    });
                } catch (err) {
                    console.error("❌ Error al leer el stream:", err);
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "⚠️ Se interrumpió la conexión con el modelo.",
                        },
                    ]);
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "❌ Error al conectar con el servidor." },
            ]);
        } finally {
            setLoading(false);
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <section className="flex flex-col h-screen gap-6 py-16 justify-center items-center">
            <div className="w-full justify-end flex gap-3">
                <Link href={"/"}>
                    <GithubIcon className="text-default-500" />
                </Link>
                <ThemeSwitch />
            </div>

            <Card className="w-full max-w-5xl flex-1 bg-gray-700/70 backdrop-blur-md border border-white/10 shadow-lg">
                <CardBody>
                    <ScrollShadow hideScrollBar className="h-[70vh] space-y-3">
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 italic">
                                No messages yet. Start chatting below 👇
                            </p>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage msg={msg} key={i} />
                        ))}
                    </ScrollShadow>
                </CardBody>
            </Card>

            <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full max-w-5xl">
                <div className="w-full flex gap-2 mt-4">
                    <Textarea
                        placeholder="Type something..."
                        size="lg"
                        value={input}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setInput(e.target.value)}
                        isDisabled={loading}
                    />
                    <Button color="primary" size="lg" isLoading={loading} onPress={sendMessage}>
                        <SendIcon />
                    </Button>
                </div>
            </Form>
        </section>
    );
}

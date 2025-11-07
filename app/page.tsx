"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Message } from "@/types";
import { SendIcon } from "@/components/ui/icons";

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();
            console.log(data);

            const botMsg: Message = { role: "assistant", content: data.reply };

            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const errorMsg: Message = {
                role: "assistant",
                content: "❌ Error al conectar con el servidor.",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <section className="flex flex-col h-screen py-16 justify-center items-center">
            <Card className="w-full max-w-5xl flex-1 bg-gray-700/70 backdrop-blur-md border border-white/10 shadow-lg">
                <CardBody>
                    <ScrollShadow hideScrollBar className="h-[70vh] space-y-3">
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 italic">
                                No messages yet. Start chatting below 👇
                            </p>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md 
                                        ${msg.role === "user"
                                            ? "bg-primary text-white"
                                            : "bg-gray-700 text-gray-100"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </ScrollShadow>
                </CardBody>
            </Card>

            {/* Input form */}
            <div className="w-full max-w-5xl flex gap-2 mt-4">
                <Input
                    placeholder="Type something..."
                    size="lg"
                    value={input}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setInput(e.target.value)}
                    isDisabled={loading}
                />
                <Button color="primary" size="lg" onClick={sendMessage} isLoading={loading}>
                    <SendIcon />
                </Button>
            </div>
        </section>
    );
}

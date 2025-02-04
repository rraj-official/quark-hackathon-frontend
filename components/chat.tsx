// chat.tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { type CoreMessage } from "ai";
import { BsNvidia } from "react-icons/bs";
import ChatInput from "./chat-input";
import { FaUserAstronaut } from "react-icons/fa6";
import { IoLogoVercel } from "react-icons/io5";
import { continueConversation, continueConversationFile } from "../app/actions";
import { toast } from "sonner";
import remarkGfm from "remark-gfm";
import { MemoizedReactMarkdown } from "./markdown";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim().length === 0) return;

    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: "user" },
    ];

    setMessages(newMessages);
    setInput("");

    try {
      // Get the assistant reply as a single text string
      const result = await continueConversation(newMessages);
      // Update messages with the assistant response
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: result,
        },
      ]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  // New function: handle a recorded file submission
  const handleFileSubmit = async (file: File) => {
    // Add a placeholder message for the voice input
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: "[Voice message]", role: "user" },
    ];
    setMessages(newMessages);
    try {
      const result = await continueConversationFile(file);
      setMessages([
        ...newMessages,
        { role: "assistant", content: result },
      ]);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="stretch mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 pb-[8rem] pt-[6rem] md:px-0 md:pt-[4rem] xl:pt-[2rem]">
        <h1 className="text-center text-5xl font-medium tracking-tighter">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-nvidia hover:cursor-pointer transition-all duration-150 ease-linear">
            InsureWise
          {/* </a>{" "}
          +{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-150 ease-linear hover:text-blue-600"
            href="https://sdk.vercel.ai/">
            Vercel AI SDK */}
          </a>{" "}
        </h1>
        <h2 className="text-center text-nvidia">by Wissen Technology</h2>
        <div className="mt-6 flex items-center justify-center gap-4">
          <IoLogoVercel className="size-20" />
        </div>

        <div className="mt-6 px-3 md:px-0">
          <h2 className="text-base font-medium">Points to note:</h2>
          <ul className="ml-6 mt-2 flex list-disc flex-col items-start gap-2.5 text-sm text-primary/80">
            <li>
            <span className="text-nvidia font-medium">Insurewise</span>{" "}
             is designed to scale effortlessly and supports multiple languages, enabling users from diverse regions to access relevant life insurance information.
            </li>
            <li>
            Built on an open-source framework, Insurewise ensures flexibility, transparency, and cost-efficiency, promoting continuous community contributions and improvements.
            </li>
            <li>
            By leveraging a small language model, Insurewise provides quick and contextually relevant responses, ensuring efficient interaction even with large volumes of queries.
            </li>
            <li>
            The RAG-powered backend enables Insurewise to pull the latest, accurate information on life insurance plans from leading agencies like LIC and MaxLife, delivering real-time, reliable insights.
            </li>
          </ul>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  }

  // (The rest of your chat UI remains unchanged)
  return (
    <div className="stretch mx-auto w-full max-w-2xl px-4 py-[8rem] pt-24 md:px-0">
      {messages.map((m, i) => (
        <div key={i} className="mb-4 flex items-start p-2">
          <div>
            {m.role === "user" ? (
              <FaUserAstronaut />
            ) : (
              <IoLogoVercel className="size-4" />
            )}
          </div>
          <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
            <MemoizedReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-sm break-words dark:prose-invert prose-pre:rounded-lg prose-pre:bg-zinc-100 prose-pre:p-4 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-100"
            >
              {m.content as string}
            </MemoizedReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        handleFileSubmit={handleFileSubmit} // pass our new callback
      />
    </div>
  );
}

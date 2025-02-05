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

// A simple component to animate the "Thinking" dots
function ThinkingDots() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>Thinking{dots}</span>;
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const THOUGHT_MARKER = "__THINKING__"; // marker for the animated placeholder

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim().length === 0) return;

    // Add the user message
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: "user" },
    ];
    setMessages(newMessages);
    setInput("");

    // Add a placeholder for the assistant's response using the marker
    const placeholderMessage: CoreMessage = { role: "assistant", content: THOUGHT_MARKER };
    setMessages([...newMessages, placeholderMessage]);

    try {
      // Get the assistant reply as a single text string
      // (We pass newMessages without the placeholder to the backend)
      const result = await continueConversation(newMessages);
      // Update the placeholder with the actual result
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = { role: "assistant", content: result };
        return updatedMessages;
      });
    } catch (error) {
      toast.error((error as Error).message);
      // Optionally, update the placeholder with an error message
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: "Error retrieving answer.",
        };
        return updatedMessages;
      });
    }
  };

  // Handle voice message submissions
  const handleFileSubmit = async (file: File) => {
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: "[Voice message]", role: "user" },
    ];
    setMessages(newMessages);

    // Add a placeholder for the assistant's response
    const placeholderMessage: CoreMessage = { role: "assistant", content: THOUGHT_MARKER };
    setMessages([...newMessages, placeholderMessage]);

    try {
      const result = await continueConversationFile(file);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = { role: "assistant", content: result };
        return updatedMessages;
      });
    } catch (error) {
      toast.error((error as Error).message);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: "Error retrieving answer.",
        };
        return updatedMessages;
      });
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
            className="hover:text-nvidia hover:cursor-pointer transition-all duration-150 ease-linear"
          >
            InsureWise
          </a>
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

        <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} />
      </div>
    );
  }

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
            {m.content === THOUGHT_MARKER ? (
              // Render the animated ThinkingDots component if the marker is found
              <ThinkingDots />
            ) : (
              <MemoizedReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm break-words dark:prose-invert prose-pre:rounded-lg prose-pre:bg-zinc-100 prose-pre:p-4 prose-pre:text-zinc-900 dark:prose-pre:bg-zinc-900 dark:prose-pre:text-zinc-100"
              >
                {m.content as string}
              </MemoizedReactMarkdown>
            )}
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

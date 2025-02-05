// actions.tsx
"use client";

import { CoreMessage } from "ai";

export async function continueConversation(messages: CoreMessage[]) {
  // Perform a POST request to your local server
  console.log(messages);
  const response = await fetch("http://localhost:8000/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch from python backend");
  }

  const data = await response.json();
  console.log(data);
  return data.answer;
}

// New function to handle file uploads
export async function continueConversationFile(file: File) {
  console.log("Sending Voicenote");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/voice", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from python backend");
  }

  const data = await response.json();
  return data.answer;
}

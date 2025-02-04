"use server";

import { CoreMessage } from "ai";

export async function continueConversation(messages: CoreMessage[]) {
  // Perform a POST request to your local server
  console.log(messages);
  const response = await fetch("http://0.0.0.0:8000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Send the messages array as JSON. Adjust the payload shape if your API expects something different.
    
    body: JSON.stringify({ messages }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch from python backend");
  }

  // Assume your local server returns a JSON with a "text" property, e.g. { "text": "assistant reply" }
  const data = await response.json();

  // Return the response text directly
  console.log(data);
  return data.answer;
}

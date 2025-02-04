// chat-input.tsx
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import Textarea from "react-textarea-autosize";
import { AiOutlineEnter } from "react-icons/ai";
import { IoMic } from "react-icons/io5";

type ChatInputProps = {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  // New prop: a function that accepts a recorded file
  handleFileSubmit?: (file: File) => Promise<void>;
};

export default function ChatInput({
  input,
  setInput,
  handleSubmit,
  handleFileSubmit,
}: ChatInputProps) {
  // State for managing recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording: this will trigger recorder.onstop below.
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = async () => {
          // Create a blob from the recorded chunks
          const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
          // Optionally wrap it in a File object (backend may expect a file upload)
          const file = new File([blob], "recording.webm", { type: "audio/webm" });
          // Call the provided file-submit callback if available
          if (handleFileSubmit) {
            await handleFileSubmit(file);
          }
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-zinc-100 to-transparent backdrop-blur-lg dark:from-background"
    >
      <div className="w-full max-w-2xl items-center px-6">
        <div className="relative flex w-full flex-col items-start gap-2">
          <div className="relative flex w-full items-center">
            <Textarea
              name="message"
              rows={1}
              maxRows={5}
              tabIndex={0}
              placeholder="Try asking me something!"
              spellCheck={false}
              value={input}
              className="focus-visible:ring-nvidia min-h-12 w-full resize-none rounded-[28px] border border-input bg-muted pb-1 pl-4 pr-10 pt-3 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  if (input.trim().length > 0) {
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }
              }}
            />
            <Button
              type="button"
              onClick={handleMicClick}
              size="icon"
              variant="ghost"
              className="absolute right-10 top-1/2 -translate-y-1/2 transform"
            >
              <IoMic color={isRecording ? "red" : "inherit"} />
            </Button>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 mr-1 -translate-y-1/2 transform"
              disabled={input.length === 0}
            >
              <AiOutlineEnter size={20} />
            </Button>
          </div>
        </div>
        <p className="p-2 text-center text-xs text-zinc-400">
          Brought to you by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="md:hover:text-nvidia underline underline-offset-2 transition-all duration-150 ease-linear"
          >
            Wissen Technology
          </a>
        </p>
      </div>
    </form>
  );
}

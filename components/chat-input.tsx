import { Button } from "./ui/button";
import Textarea from "react-textarea-autosize";
import { AiOutlineEnter } from "react-icons/ai";

type ChatInputProps = {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function ChatInput({
  input,
  setInput,
  handleSubmit,
}: ChatInputProps) {
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
            href="https://lakshb.dev"
          >
            lakshb.dev
          </a>
        </p>
      </div>
    </form>
  );
}

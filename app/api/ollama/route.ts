import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ollama } from "ai-sdk-ollama";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: ollama("gpt-oss:20b"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}

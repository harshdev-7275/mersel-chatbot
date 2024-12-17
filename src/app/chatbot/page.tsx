"use client";
import { CustomMarkdownComponents } from "@/components/chatbot-components/CustomMarkdownComponents";
import MessageInput from "@/components/chatbot-components/MessageInput";
import TypewriterText from "@/components/chatbot-components/TypewriterText";
import DynamicCard from "@/components/DynamicCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RespondQuery } from "@/helper/constant";

import axios from "axios";
import { API_URL } from "../../../env";
import { BotIcon, RotateCcw, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

import useAuthStore from "@/store/auth-store";
import { useRouter } from "next/navigation";
import MarkdownRenderer from "@/components/chatbot-components/MarkdownRenderer";
import useConversationStore from "@/store/useConversationStore";
import { Button } from "@/components/ui/button";
import {v4 as uuid} from "uuid"

interface Message {
  sender: "user" | "bot";
  content: string;
  meta_data?: {
    cards: [
      {
        cardTitle: string;
        submissionEndpoint: string;
        fields: [
          {
            heading: string;
            content: string;
          }
        ];
      }
    ];
  };
  isStreaming?: boolean;
}

interface Messages {
  ai_response: string;
  datetime: string;
  id: string;
  user_query: string;
}

interface Conversation {
  last_active_datetime: string;
  messages: Messages[];
  session_id: string;
  start_datetime: string;
  title: string;
}

// Dummy conversations data
const conversations: Conversation[] = [
  {
    last_active_datetime: "2024-11-25T09:00:00.000000Z",
    messages: [
      {
        ai_response: "Welcome! How can I help you today?",
        datetime: "2024-11-25T08:55:00.123456Z",
        id: "d7f8e9c0-a1b2-3c4d-5e6f-7g8h9i0j1k2l",
        user_query: "Hello",
      },
    ],
    session_id: "abcdef12-3456-7890-abcd-ef1234567890",
    start_datetime: "2024-11-25T08:50:00.000000Z",
    title: "Chat with AI",
  },
  {
    last_active_datetime: "2024-11-24T10:30:00.000000Z",
    messages: [
      {
        ai_response: "hello from bot!",
        datetime: "2024-11-24T10:25:00.123456Z",
        id: "d7f8e9c0-a1b2-3c4d-5e6f-7g8h9i0j1k2l",
        user_query: "Hello",
      },
    ],
    session_id: "ghijkl34-5678-9101-abcd-ef1234567890",
    start_datetime: "2024-11-24T10:00:00.000000Z",
    title: "Chat with another",
  },
];

export default function Chatbot() {


    const { conversationId } = useConversationStore();

    const [messages, setMessages] = useState<Message[]>([]);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const streamingMessageRef = useRef<string>("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isNewConversation, setIsNewConversation] = useState(true);
    const [isMessageLoading, setIsMessageLoading] = useState(true);
    const [isResetLogoMoving, setIsResetLogoMoving] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

  
    const { token, user_id } = useAuthStore(); 

    const router = useRouter();
  
    useEffect(() => {
      console.log("token in chatbot", token);
      if (!token) {
        router.push("/");
      }
    }, [token, router]);
  
    const getMessageBySession = async () => {
        try {
          const res = await axios.get(`${API_URL}/conversation/session?user_id=${user_id}`);
          console.log("Backend response:", res.data);
    
          const transformedMessages: Message[] = res.data
            .map((msg: any) => [
              {
                sender: "user",
                content: msg.user_query,
              },
              {
                sender: "bot",
                content: msg.ai_response,
                meta_data: msg.meta_data, // Pass metadata for cards
              },
            ])
            .flat();
          setMessages(transformedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setIsMessageLoading(false);
        }
      };
    useEffect(() => {
      setIsMessageLoading(true); // Trigger skeleton loading
      getMessageBySession();
    }, [conversationId]);
  
    useEffect(() => {
      // Find the conversation matching the current conversationId
      const conversation = conversations.find(
        (conv) => conv.session_id === conversationId
      );
  
      if (conversation) {
        // Transform the conversation messages to match the Message[] format
        const transformedMessages: any = conversation.messages
          .map((msg) => [
            { sender: "user", content: msg.user_query },
            { sender: "bot", content: msg.ai_response },
          ])
          .flat();
  
        // Update the messages state
        setMessages(transformedMessages);
      } else {
  
        setMessages([]);
      }
    }, [user_id]);


    const handleReset = async () => {
        setIsResetLogoMoving(true);
        try {
          const res = await axios.post(`${API_URL}/conversation/reset`, {
            user_id,
          });
          console.log("Reset response:", res.data);
          setMessages([]);
          setIsNewConversation(true); 
        } catch (error) {
          console.error("Error resetting conversation:", error);
        }finally{
          setIsResetLogoMoving(false);
        }
      };
    
  
    const handleSend = async (message: string) => {
       
      setIsStreaming(true);
      streamingMessageRef.current = "";
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", content: message },
        { sender: "bot", content: "", isStreaming: true },
      ]);
  
      await getBotResponse(
        message,
        isNewConversation,
        (chunk) => {
          streamingMessageRef.current += chunk;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
              lastMessage.content = streamingMessageRef.current;
            }
            return updatedMessages;
          });
          throttledScrollToBottom();
        },
        (cards: any) => {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
              lastMessage.meta_data = { ...lastMessage.meta_data, cards };
            }
            return updatedMessages;
          });
        }
      );
  
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage) {
          lastMessage.isStreaming = false;
        }
        return updatedMessages;
      });
  
      focusInput();
      setIsStreaming(false);
      setIsNewConversation(false); // Set to false after the first message
    };
  
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior,
        });
      }
    };
  
  
    const throttledScrollToBottom = useCallback(
      throttle(() => {
        scrollToBottom("smooth");
      }, 100), // Adjust the delay (100ms) as needed
      []
    );
  
    // Scroll smoothly when a new message is added
    useEffect(() => {
      if (!isStreaming) {
        scrollToBottom("smooth");
      }
    }, [messages.length]);
  
    // Scroll smoothly during streaming
    useEffect(() => {
      if (isStreaming) {
        throttledScrollToBottom();
      }
    }, [messages[messages.length - 1]?.content]);
  
    const focusInput = () => {
      inputRef.current?.focus();
    };
  
    useEffect(() => {
      focusInput();
    }, []);
  
    const skeletonMessages = [
      {
        sender: "user",
        content: "Hello, how can I help you today?",
      },
      {
        sender: "bot",
        content: "Hello, how can I help you today?",
      },
    ];
  
    // Throttle function
    function throttle(func: (...args: any[]) => void, limit: number) {
      let lastFunc: NodeJS.Timeout;
      let lastRan: number;
      return function (this:any,...args: any[]) {
        if (!lastRan) {
          func.apply(this, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(() => {
            if (Date.now() - lastRan >= limit) {
              func.apply(this, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    }
  
    async function getBotResponse(
      message: string,
      isNewConversation: boolean,
      onMessageChunk: (chunk: string) => void,
      onCardsReceived?: (cards: any[]) => void
    ): Promise<void> {
      try {
        console.log("message", isNewConversation);
        const response = await fetch(`${API_URL}/conversation/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user_id,
            query: message,
            fixed_data: {
              token: token,
            },
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to send the query");
        }
  
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
  
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
  
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Preserve incomplete line
  
          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data) {
                try {
                  const parsedData = JSON.parse(data);
  
                  // Handle message chunks
                  if (parsedData.message_chunk) {
                    onMessageChunk(parsedData.message_chunk);
                  }
  
                  // Handle cards in metadata
                  if (parsedData.meta_data?.cards) {
                    const cards = parsedData.meta_data.cards;
                    if (onCardsReceived) {
                      onCardsReceived(cards);
                    }
                  }
                } catch (error) {
                  console.error("Error parsing response:", error);
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Error with fetch:", error);
        onMessageChunk("Error retrieving response.");
      }
    }
  return (
    <div className="flex flex-col items-center bg-[#EBF1F4] h-full w-full p-4 overflow-hidden">
       
      <div className="w-full max-w-[900px] container mx-auto mt-6 flex flex-col items-center">
        <div
          ref={messagesContainerRef}
          className="flex-grow w-full overflow-y-auto scrollbar-hide space-y-4 mb-4"
        >
          {isMessageLoading ? (
            skeletonMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 ${
                    msg.sender === "user"
                      ? "flex-row-reverse items-start"
                      : "items-end"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User color="#231F20" size={24} />
                  ) : isStreaming ? (
                    <User color="#1875AA" size={24} className="shrink-0" />
                  ) : (
                    <BotIcon color="#1875AA" size={24} className="shrink-0" />
                  )}
                  <div
                    className={`p-2 rounded-lg max-w-full ${
                      msg.sender === "user"
                        ? "bg-white text-white text-right"
                        : "bg-white text-white text-left"
                    }`}
                  >
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                </div>
              </div>
            ))
          ) : messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 ${
                    msg.sender === "user"
                      ? "flex-row-reverse items-start"
                      : "items-end"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User color="#231F20" size={24} />
                  ) : isStreaming ? (
                    <BotIcon color="#1875AA" size={24} className="shrink-0" />
                  ) : (
                    <BotIcon color="#1875AA" size={24} className="shrink-0" />
                  )}
                  <div className="flex flex-col gap-5">
                    <div
                      className={`p-2 rounded-lg max-w-full ${
                        msg.sender === "user"
                          ? "bg-white text-right"
                          : "bg-white text-left"
                      }`}
                    >
                      <MarkdownRenderer content={msg.content} inline={true} />
                    </div>
                    <div>
                      {msg.meta_data?.cards && (
                        <DynamicCard
                          cardTitle={
                            msg.meta_data?.cards[0].cardTitle || "Default Title"
                          }
                          fields={
                            msg.meta_data?.cards[0].fields?.length
                              ? msg.meta_data?.cards[0].fields
                              : [{ heading: "", content: "" }]
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full h-[80%] mt-10 overflow-hidden">
              <Image
                src="/logo_mersal_splash.png"
                width={150}
                height={150}
                alt="logo-img"
              />
              <TypewriterText />
            </div>
          )}
        </div>
        <div className="w-full">
          {isStreaming && (
            <div className="flex justify-center w-full mb-4">
              <div className="flex space-x-2">
                <div
                  className="h-3 w-3 rounded-full animate-blue-white"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="h-3 w-3 rounded-full animate-blue-white"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="h-3 w-3 rounded-full animate-blue-white"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
            </div>
          )}

          <MessageInput
            onSend={handleSend}
            disabled={isStreaming}
            styles="bg-white text-[#231F20] w-full mx-auto px-4 py-1 fixed bottom-2 left-0 min-h-[50px] max-h-[100px]"
            // inputRef={textAreaRef}
          />
        </div>
       
      </div>
      <Button
        onClick={handleReset}
        className="fixed flex flex-col items-center justify-center top-1 left-1 z-10 bg-[#1875AA] text-white px-2 py-7 shadow-md shadow-blue-300 "
      >
        <RotateCcw className={`${isResetLogoMoving && "animate-spin"}`} />
        <span className="uppercase leading-tight">Reset</span>
      </Button>

    </div>
  );
}

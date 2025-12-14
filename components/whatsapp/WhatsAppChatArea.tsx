"use client";

import * as Lucide from 'lucide-react';
const { Paperclip, Smile, Send, Check, CheckCheck, Clock } = Lucide as any;
import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhatsAppMessage as Message } from '@/types/whatsapp';

interface WhatsAppChatAreaProps {
  messages: Message[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  renderLinkPreview: (message: Message) => React.ReactNode;
  renderMedia: (message: Message) => React.ReactNode;
}

export function WhatsAppChatArea({
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  getStatusIcon,
  renderLinkPreview,
  renderMedia,
}: WhatsAppChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Área de mensajes */}
      <ScrollArea className="flex-1 p-4 chat-scroll">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromContact ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isFromContact
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-green-500 text-white'
                }`}
              >
                {message.type === 'flow_response' && message.flowData ? (
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{message.flowData.question}</p>
                    <div className="space-y-1">
                      {message.flowData.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-2 rounded ${
                            message.flowData?.selectedOption === option
                              ? 'bg-white/20 font-semibold'
                              : 'bg-white/10'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {message.mediaUrl && renderMedia(message)}
                    {message.content && (
                      <p className="text-sm break-words">
                        {message.content}
                      </p>
                    )}
                    {renderLinkPreview(message)}
                  </div>
                )}
                
                <div className={`flex items-center justify-end gap-1 mt-1 ${
                  message.isFromContact ? 'text-gray-500' : 'text-green-100'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {!message.isFromContact && getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input de mensaje */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="quick-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*"
          />
          <Textarea
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 min-h-10 max-h-24 resize-none"
          />
          <Button
            variant="ghost"
            size="sm"
            className="quick-action-btn"
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as Lucide from 'lucide-react';
const { Search, Star, Bot } = Lucide as any;
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhatsAppContact as Contact } from '@/types/whatsapp';

interface WhatsAppContactListProps {
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContact: Contact | null;
  searchTerm: string;
  activeTab: string;
  onSearchChange: (value: string) => void;
  onTabChange: (value: string) => void;
  onContactSelect: (contact: Contact) => void;
  getFlowStatusColor: (status: string) => string;
}

export function WhatsAppContactList({
  contacts,
  filteredContacts,
  selectedContact,
  searchTerm,
  activeTab,
  onSearchChange,
  onTabChange,
  onContactSelect,
  getFlowStatusColor,
}: WhatsAppContactListProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-w-0 flex-shrink-0">
      {/* Search y filtros */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chats" className="text-xs">
              Chats ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              No leídos ({contacts.filter(c => c.unreadCount > 0).length})
            </TabsTrigger>
            <TabsTrigger value="flows" className="text-xs">
              Flujos ({contacts.filter(c => c.flowStatus === 'active').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1 chat-scroll">
        <div className="p-2">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onContactSelect(contact)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    {contact.isPinned && <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{contact.lastMessageTime}</span>
                </div>

                {contact.flowStatus && (
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`text-xs status-badge flow-status-badge ${getFlowStatusColor(contact.flowStatus)}`}>
                      <Bot className="w-3 h-3 mr-1" />
                      {contact.flowStatus === 'active' ? 'Activo' : 
                       contact.flowStatus === 'completed' ? 'Completado' : 
                       contact.flowStatus === 'paused' ? 'Pausado' : contact.flowStatus}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-sm text-gray-600 truncate flex-1">{contact.lastMessage}</p>
                  {contact.unreadCount > 0 && (
                    <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full flex-shrink-0">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
                
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs whitespace-nowrap">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

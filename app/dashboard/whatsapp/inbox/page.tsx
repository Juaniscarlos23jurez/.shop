"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Bot,
  Check,
  CheckCheck,
  Clock,
  User,
  Filter
} from 'lucide-react';

// Importar tipos desde el archivo de tipos
import { 
  WhatsAppContact as Contact, 
  WhatsAppMessage as Message
} from '@/types/whatsapp';

export default function WhatsAppInbox() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para los datos
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    if (!user?.company_id || !token) return;

    try {
      const response = await api.whatsapp.getContacts(
        String(user.company_id),
        token,
        { status: activeTab === 'unread' ? 'unread' : 'all' }
      );

      if (response.success && response.data) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user?.company_id || !token) return;

    try {
      const response = await api.whatsapp.getMessages(
        String(user.company_id),
        contactId,
        token
      );

      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageInput,
      type: 'text',
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Actualizar UI inmediatamente
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');

    // Enviar al backend
    if (!user?.company_id || !token) return;

    setLoading(true);
    try {
      const response = await api.whatsapp.sendMessage(
        String(user.company_id),
        selectedContact.id,
        {
          content: newMessage.content,
          type: 'text',
        },
        token
      );

      if (!response.success) {
        toast({
          title: "Error",
          description: "No se pudo enviar el mensaje",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    fetchMessages(contact.id);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // TODO: Implementar subida de archivos
    console.log('File selected:', file);
    event.target.value = '';
  };

  const handleTriggerFlow = async (flowId: string) => {
    if (!selectedContact || !user?.company_id || !token) return;

    setLoading(true);
    try {
      const response = await api.whatsapp.triggerFlow(
        String(user.company_id),
        selectedContact.id,
        flowId,
        token
      );

      if (response.success) {
        toast({
          title: "Flujo iniciado",
          description: `Se inició el flujo automático para ${selectedContact.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el flujo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const renderMessage = (message: Message) => {
    const isIncoming = message.direction === 'incoming';
    
    return (
      <div
        key={message.id}
        className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            isIncoming
              ? 'bg-gray-100 text-gray-900'
              : 'bg-green-500 text-white'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center gap-1 mt-1 ${
            isIncoming ? 'justify-end' : 'justify-start'
          }`}>
            <span className={`text-xs ${
              isIncoming ? 'text-gray-500' : 'text-green-100'
            }`}>
              {formatTime(message.timestamp)}
            </span>
            {!isIncoming && (
              <>
                {message.status === 'sent' && <Check className="w-3 h-3 text-green-100" />}
                {message.status === 'delivered' && <CheckCheck className="w-3 h-3 text-green-100" />}
                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                {message.status === 'pending' && <Clock className="w-3 h-3 text-green-100" />}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white">
      {/* Lista de contactos */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">WhatsApp</h2>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="unread">No leídos</TabsTrigger>
              <TabsTrigger value="flows">Flujos</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contact list */}
        <ScrollArea className="flex-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${
                selectedContact?.id === contact.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="relative">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{contact.name}</p>
                  <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  {contact.unreadCount > 0 && (
                    <Badge className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {contact.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Área de chat */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Header del chat */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedContact.avatar ? (
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{selectedContact.name}</p>
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bot className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleTriggerFlow('welcome')}>
                      Flujo de bienvenida
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTriggerFlow('support')}>
                      Flujo de soporte
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard/whatsapp/automatizacion')}>
                      Gestionar flujos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <ScrollArea className="flex-1 p-4">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Textarea
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[40px] max-h-32 resize-none"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || loading}
                className="bg-green-500 hover:bg-green-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp Business</h3>
            <p className="text-gray-500">Selecciona una conversación para comenzar</p>
          </div>
        </div>
      )}
    </div>
  );
}

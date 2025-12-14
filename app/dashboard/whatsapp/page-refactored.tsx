"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/whatsapp.css';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppConnectionStep } from '@/components/whatsapp/WhatsAppConnectionStep';
import { WhatsAppHeader } from '@/components/whatsapp/WhatsAppHeader';
import { WhatsAppContactList } from '@/components/whatsapp/WhatsAppContactList';
import { WhatsAppChatArea } from '@/components/whatsapp/WhatsAppChatArea';
import { useWhatsAppSession } from '@/components/whatsapp/useWhatsAppSession';
import { WhatsAppContact as Contact, WhatsAppMessage as Message } from '@/types/whatsapp';

export default function WhatsAppPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const { sessionStatus, qrCodeUrl, sessionError, startWhatsAppSession, checkWhatsAppSessionStatus, hasFetchedStatus } = useWhatsAppSession();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('chats');

  // Datos de ejemplo
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'María González',
      phone: '+52 55 1234 5678',
      avatar: '',
      isOnline: true,
      unreadCount: 3,
      lastMessage: 'Hola, ¿tienen disponible el producto X?',
      lastMessageTime: '10:30',
      isPinned: true,
      tags: ['cliente-vip', 'interesado'],
      flowStatus: 'active'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      phone: '+52 55 9876 5432',
      avatar: '',
      isOnline: false,
      lastSeen: 'hace 5 min',
      unreadCount: 0,
      lastMessage: 'Perfecto, gracias por la información',
      lastMessageTime: '09:45',
      isPinned: false,
      tags: ['cliente-nuevo'],
      flowStatus: 'completed'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      phone: '+52 55 5555 1234',
      avatar: '',
      isOnline: false,
      lastSeen: 'hace 2 horas',
      unreadCount: 1,
      lastMessage: '¿Cuáles son sus horarios?',
      lastMessageTime: 'ayer',
      isPinned: false,
      tags: ['consulta'],
      flowStatus: 'paused'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      contactId: '1',
      content: 'Hola, buenos días',
      timestamp: '10:25',
      isFromContact: true,
      status: 'read',
      type: 'text'
    },
    {
      id: '2',
      contactId: '1',
      content: '¡Hola María! ¿En qué te podemos ayudar hoy?',
      timestamp: '10:26',
      isFromContact: false,
      status: 'read',
      type: 'text'
    },
    {
      id: '3',
      contactId: '1',
      content: 'Estoy interesada en sus productos',
      timestamp: '10:28',
      isFromContact: true,
      status: 'read',
      type: 'text'
    },
    {
      id: '4',
      contactId: '1',
      content: '¿Qué tipo de producto te interesa?',
      timestamp: '10:29',
      isFromContact: false,
      status: 'read',
      type: 'flow_response',
      flowData: {
        question: '¿Qué tipo de producto te interesa?',
        options: ['Comida', 'Bebidas', 'Postres', 'Combos'],
        selectedOption: 'Comida'
      }
    },
    {
      id: '5',
      contactId: '1',
      content: 'Hola, ¿tienen disponible el producto X?',
      timestamp: '10:30',
      isFromContact: true,
      status: 'delivered',
      type: 'text'
    }
  ]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'unread':
        return contact.unreadCount > 0;
      case 'flows':
        return contact.flowStatus === 'active';
      case 'chats':
      default:
        return true;
    }
  });

  const selectedContactMessages = selectedContact 
    ? messages.filter(msg => msg.contactId === selectedContact.id)
    : [];

  // Verificar sesión al montar
  useEffect(() => {
    if (token && user?.company_id) {
      console.log('[WhatsApp] Verificando estado inicial de sesión...');
      checkWhatsAppSessionStatus(token, String(user.company_id));
    }
  }, [token, user?.company_id]);

  // Polling cuando esperamos QR
  useEffect(() => {
    if (sessionStatus !== 'waiting_qr' && sessionStatus !== 'connecting') return;

    const interval = setInterval(() => {
      if (token && user?.company_id) {
        checkWhatsAppSessionStatus(token, String(user.company_id));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionStatus, token, user?.company_id, checkWhatsAppSessionStatus]);

  const handleStartSession = async () => {
    if (token && user?.company_id) {
      await startWhatsAppSession(token, String(user.company_id));
    } else {
      toast({
        title: 'Sesión requerida',
        description: 'Debes iniciar sesión para conectar WhatsApp',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage: Message = {
      id: String(Date.now()),
      contactId: selectedContact.id,
      content: messageInput,
      timestamp,
      isFromContact: false,
      status: 'sent',
      type: 'text',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
  };

  const getFlowStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'sent': '✓',
      'delivered': '✓✓',
      'read': '✓✓',
      'pending': '⏱',
    };
    return icons[status] || '';
  };

  const renderLinkPreview = (message: Message) => {
    if (!message.linkPreview) return null;
    return (
      <div className="mt-2 border border-gray-300 rounded overflow-hidden text-sm">
        {message.linkPreview.imageUrl && (
          <img src={message.linkPreview.imageUrl} alt="preview" className="w-full h-32 object-cover" />
        )}
        <div className="p-2">
          {message.linkPreview.title && <p className="font-medium truncate">{message.linkPreview.title}</p>}
          {message.linkPreview.description && <p className="text-xs text-gray-600 line-clamp-2">{message.linkPreview.description}</p>}
          <p className="text-xs text-blue-600 truncate">{message.linkPreview.url}</p>
        </div>
      </div>
    );
  };

  const renderMedia = (message: Message) => {
    if (!message.mediaUrl) return null;
    return (
      <img src={message.mediaUrl} alt="media" className="max-w-xs rounded" />
    );
  };

  if (!hasFetchedStatus) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500 animate-pulse">Verificando estado de WhatsApp...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {sessionStatus === 'connected' ? (
        <>
          <WhatsAppHeader selectedContactName={selectedContact?.name} />
          <div className="flex-1 flex overflow-hidden">
            <WhatsAppContactList
              contacts={contacts}
              filteredContacts={filteredContacts}
              selectedContact={selectedContact}
              searchTerm={searchTerm}
              activeTab={activeTab}
              onSearchChange={setSearchTerm}
              onTabChange={setActiveTab}
              onContactSelect={setSelectedContact}
              getFlowStatusColor={getFlowStatusColor}
            />
            {selectedContact ? (
              <WhatsAppChatArea
                messages={selectedContactMessages}
                messageInput={messageInput}
                onMessageInputChange={setMessageInput}
                onSendMessage={handleSendMessage}
                getStatusIcon={getStatusIcon}
                renderLinkPreview={renderLinkPreview}
                renderMedia={renderMedia}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Selecciona una conversación para comenzar</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <WhatsAppConnectionStep
          qrCodeUrl={qrCodeUrl}
          sessionStatus={sessionStatus}
          sessionError={sessionError}
          onStartSession={handleStartSession}
        />
      )}
    </div>
  );
}

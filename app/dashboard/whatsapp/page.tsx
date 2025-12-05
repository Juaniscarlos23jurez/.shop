"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/whatsapp.css';
import * as Lucide from 'lucide-react';
const { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Send, 
  Check, 
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  MessageSquare,
  Users,
  Settings,
  ArrowLeft,
  Plus,
  Filter,
  Bot,
  Zap,
  TrendingUp,
  X,
  Edit,
  Pause,
  Play
} = Lucide as any;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { whatsappApi } from "@/lib/api/whatsapp";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Importar tipos desde el archivo de tipos
import { 
  WhatsAppContact as Contact, 
  WhatsAppMessage as Message
} from '@/types/whatsapp';

export default function WhatsAppPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<'disconnected' | 'connecting' | 'waiting_qr' | 'connected' | 'error'>('disconnected');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (qrCodeUrl) {
      console.log('[WhatsApp] qrCodeUrl actualizado:', qrCodeUrl);
    } else {
      console.log('[WhatsApp] qrCodeUrl vacío, no hay imagen para mostrar');
    }
  }, [qrCodeUrl]);

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
    
    // Filtrar por tab activo
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedContactMessages]);

  // --- FLUJO DE CONEXIÓN WHATSAPP WEB CON QR ---
  // Estas funciones están pensadas para integrarse con tu backend Laravel.
  // Solo reemplaza las URLs de fetch por tus endpoints reales.

  const startWhatsAppSession = async () => {
    console.log('[WhatsApp] startWhatsAppSession clicked', { user, token, company_id: user?.company_id });

    if (!user?.company_id || !token) {
      console.warn('[WhatsApp] Falta user.company_id o token, no se puede iniciar sesión de WhatsApp');
      toast({
        title: 'Sesión requerida',
        description: 'Debes iniciar sesión para conectar WhatsApp',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSessionError(null);
      setSessionStatus('connecting');

      const res = await fetch(`/api/whatsapp/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_id: user.company_id,
        }),
      });

      console.log('[WhatsApp] POST /api/whatsapp/sessions status:', res.status);
      if (!res.ok) {
        throw new Error('No se pudo iniciar la sesión de WhatsApp');
      }

      const data = await res.json();
      console.log('[WhatsApp] Sesión iniciada respuesta:', data);
      // Se espera que el backend regrese algo como:
      // { sessionId: string, qrCodeUrl: string }
      setQrCodeUrl(data.qrCodeUrl || null);
      setSessionStatus('waiting_qr');
    } catch (error: any) {
      console.error('Error iniciando sesión de WhatsApp:', error);
      setSessionError(error?.message || 'Error al iniciar sesión de WhatsApp');
      setSessionStatus('error');
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la sesión de WhatsApp',
        variant: 'destructive',
      });
    }
  };

  const checkWhatsAppSessionStatus = async () => {
    console.log('[WhatsApp] checkWhatsAppSessionStatus called', { user, token, company_id: user?.company_id });
    if (!user?.company_id || !token) {
      console.warn('[WhatsApp] No hay user.company_id o token, se omite verificación de sesión');
      return;
    }

    try {
      const res = await fetch(`/api/whatsapp/sessions/status?company_id=${user.company_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[WhatsApp] GET /api/whatsapp/sessions/status status:', res.status);
      if (!res.ok) {
        console.warn('[WhatsApp] Error al obtener estado de sesión, response not ok');
        return;
      }

      const data = await res.json();
      console.log('[WhatsApp] Estado de sesión recibido:', data);
      // Se espera algo como: { status: 'connected' | 'waiting_qr' | 'disconnected', qrCodeUrl?: string }
      setSessionStatus(data.status || 'disconnected');
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
      }
    } catch (error) {
      console.error('Error verificando estado de sesión WhatsApp:', error);
    }
  };

  // Al montar la página, verificamos si ya hay sesión activa y, si no, mostramos el flujo de conexión
  useEffect(() => {
    checkWhatsAppSessionStatus();
  }, []);

  // Polling ligero cuando estamos esperando QR o conectando
  useEffect(() => {
    if (sessionStatus !== 'waiting_qr' && sessionStatus !== 'connecting') return;

    const interval = setInterval(() => {
      checkWhatsAppSessionStatus();
    }, 5000); // cada 5s

    return () => clearInterval(interval);
  }, [sessionStatus]);

  const extractFirstUrl = (text: string): string | null => {
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const url = extractFirstUrl(messageInput);

    let linkPreview: Message['linkPreview'] | undefined;

    if (url) {
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          linkPreview = {
            url: data.url || url,
            title: data.title || undefined,
            description: data.description || undefined,
            imageUrl: data.imageUrl || undefined,
          };
        } else {
          linkPreview = { url };
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
        linkPreview = { url };
      }
    }

    const newMessage: Message = {
      id: String(Date.now()),
      contactId: selectedContact.id,
      content: messageInput,
      timestamp,
      isFromContact: false,
      status: 'sent',
      type: 'text',
      ...(linkPreview ? { linkPreview } : {}),
    };

    // Actualizar UI inmediatamente
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');

    // Si hay backend y token, intentamos enviar el mensaje de texto
    if (!user?.company_id || !token) return;

    setLoading(true);
    try {
      const response = await whatsappApi.sendMessage(
        String(user.company_id),
        selectedContact.id,
        {
          content: newMessage.content,
          type: 'text',
        },
        token
      );

      if (!response.success) {
        throw new Error(response.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje al servidor',
        variant: 'destructive',
      });
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact) return;

    const url = URL.createObjectURL(file);
    const mime = file.type;
    let type: Message['type'] = 'document';

    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('video/')) type = 'video';
    else if (mime.startsWith('audio/')) type = 'audio';

    const now = new Date();
    const timestamp = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMessage: Message = {
      id: String(Date.now()),
      contactId: selectedContact.id,
      content: file.name,
      timestamp,
      isFromContact: false,
      status: 'sent',
      type,
      mediaUrl: url,
      mediaMimeType: mime,
    };

    setMessages((prev) => [...prev, newMessage]);
    event.target.value = '';

    // Aquí podrías integrar subida real al backend/WhatsApp Business
  };

  const handleTriggerFlow = async (flowId: string) => {
    if (!selectedContact || !user?.company_id || !token) return;

    setLoading(true);
    try {
      const response = await whatsappApi.triggerFlow(
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
      } else {
        throw new Error(response.error || 'Error al iniciar flujo');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el flujo automático",
        variant: "destructive",
      });
      console.error('Error triggering flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFlowStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMedia = (message: Message) => {
    if (!message.mediaUrl) return null;

    if (message.type === 'image') {
      return (
        <img
          src={message.mediaUrl}
          alt={message.content || 'Imagen'}
          className="rounded-md max-h-64 w-full object-cover"
        />
      );
    }

    if (message.type === 'video') {
      return (
        <video
          src={message.mediaUrl}
          controls
          className="rounded-md max-h-64 w-full object-cover bg-black"
        />
      );
    }

    if (message.type === 'audio') {
      return (
        <audio src={message.mediaUrl} controls className="w-full mt-1" />
      );
    }

    // Documentos u otros
    return (
      <a
        href={message.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs underline break-all"
      >
        {message.content || 'Archivo adjunto'}
      </a>
    );
  };

  const renderLinkPreview = (message: Message) => {
    if (!message.linkPreview || message.mediaUrl) return null;

    const { url, title, description } = message.linkPreview;

    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block rounded-md border border-gray-200 bg-white/80 text-gray-900 text-xs overflow-hidden"
      >
        <div className="px-3 py-2 space-y-1">
          <div className="font-medium truncate">
            {title || url}
          </div>
          {description && (
            <div className="text-[11px] text-gray-600 line-clamp-2">
              {description}
            </div>
          )}
          <div className="text-[11px] text-gray-400 truncate">
            {url}
          </div>
        </div>
      </a>
    );
  };

  const renderHeader = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            WhatsApp Business
          </h1>
          <p className="text-sm text-gray-600">Gestiona todas tus conversaciones</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/dashboard/whatsapp/flows')}
          >
            <Bot className="w-4 h-4 mr-2" />
            Flujos Automáticos
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2" />
                Chats archivados
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <TrendingUp className="w-4 h-4 mr-2" />
                Estadísticas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  // Pantalla previa: conectar WhatsApp mediante QR
  const renderConnectionStep = () => {
    const isLoading = sessionStatus === 'connecting';

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-600" />
              Conecta tu WhatsApp Business
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Escanea el código QR con la app de WhatsApp en tu teléfono para vincular esta cuenta.
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-56 h-56 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white relative overflow-hidden">
                  {qrCodeUrl ? (
                    // Aquí puedes regresar desde Laravel una imagen PNG/SVG del QR o un data URL
                    <img
                      src={qrCodeUrl}
                      alt="Código QR de WhatsApp"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('[WhatsApp] Error al cargar imagen de QR:', {
                          src: (e.target as HTMLImageElement)?.src,
                        });
                        // Opcional: limpiar para mostrar el mensaje de texto
                        // setQrCodeUrl(null);
                      }}
                    />
                  ) : (
                    <div className="text-center px-4 text-gray-500 text-sm">
                      {isLoading
                        ? 'Generando código QR...'
                        : 'Haz clic en "Generar QR" para crear el código de conexión.'}
                    </div>
                  )}
                </div>

                <Button
                  onClick={startWhatsAppSession}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-green-500 hover:bg-green-600"
                >
                  {isLoading ? 'Conectando...' : 'Generar QR'}
                </Button>

                {sessionStatus === 'waiting_qr' && (
                  <p className="text-xs text-gray-500 text-center max-w-xs">
                    Esperando a que escanees el código desde tu teléfono. Esta pantalla se actualizará automáticamente cuando la sesión esté conectada.
                  </p>
                )}

                {sessionStatus === 'error' && sessionError && (
                  <p className="text-xs text-red-600 text-center max-w-xs">
                    {sessionError}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-3 text-sm text-gray-700">
                <h3 className="font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Cómo escanear el QR en WhatsApp
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Abre WhatsApp en tu teléfono.</li>
                  <li>Ve a <span className="font-medium">Configuración {'>'} Dispositivos vinculados</span>.</li>
                  <li>Toca <span className="font-medium">Vincular un dispositivo</span>.</li>
                  <li>Escanea el código QR que ves en esta pantalla.</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2">
                  Tu sesión se mantendrá activa en nuestros servidores mientras esta ventana esté vinculada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMainLayout = () => {
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Lista de conversaciones */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col min-w-0 flex-shrink-0">
          {/* Search y filtros */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onClick={() => setSelectedContact(contact)}
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

        {/* Área principal de chat */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Header del chat */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {selectedContact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-medium text-gray-900">{selectedContact.name}</h2>
                      <p className="text-sm text-gray-600">
                        {selectedContact.isOnline ? (
                          <span className="text-green-600">En línea</span>
                        ) : (
                          `Última vez ${selectedContact.lastSeen}`
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          {selectedContact.isPinned ? 'Desfijar' : 'Fijar'} chat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archivar chat
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Zap className="w-4 h-4 mr-2" />
                          Iniciar flujo automático
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4 chat-scroll">
                <div className="space-y-4">
                  {selectedContactMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromContact ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromContact
                            ? 'bg-white border border-gray-200'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {message.type === 'flow_response' && message.flowData ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{message.flowData.question}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {message.flowData.options.map((option, index) => (
                                <Button
                                  key={index}
                                  variant={message.flowData?.selectedOption === option ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs h-8"
                                  disabled
                                >
                                  {option}
                                </Button>
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
                    onChange={handleAttachmentChange}
                  />
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Escribe un mensaje..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[40px] max-h-32 resize-none pr-10 message-input"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Estado vacío */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-600">
                  Elige un chat de la lista para comenzar a responder mensajes
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {renderHeader()}
      {sessionStatus === 'connected' ? renderMainLayout() : renderConnectionStep()}
    </div>
  );
}

import { FlowTemplate } from "@/types/whatsapp";

export const mockFlowTemplates: FlowTemplate[] = [
  {
    id: "1",
    name: "Bienvenida Nuevos Clientes",
    description: "Flujo automático para dar la bienvenida a nuevos clientes que escriben por primera vez.",
    trigger: "first_message",
    triggerKeywords: [],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "welcome",
        type: "message",
        content: "¡Hola! 👋 Bienvenido a nuestro negocio. ¿En qué podemos ayudarte hoy?",
        nextStep: "options",
      },
      {
        id: "options",
        type: "question",
        content: "Elige una opción para continuar",
        options: ["Ver productos", "Hacer pedido", "Hablar con soporte"],
        optionConnections: {
          0: "products",
          1: "order",
          2: "support",
        },
      },
      {
        id: "products",
        type: "message",
        content: "Aquí tienes nuestros productos destacados 🛍️",
      },
      {
        id: "order",
        type: "message",
        content: "Perfecto, te ayudaremos con tu pedido. ¿Cuál es tu nombre?",
      },
      {
        id: "support",
        type: "message",
        content: "Conectándote con un asesor de soporte...",
      },
    ],
    stats: {
      totalTriggers: 120,
      completionRate: 82,
      averageTime: 65,
    },
  },
  {
    id: "2",
    name: "Seguimiento Post-Venta",
    description: "Pide feedback y ofrece un cupón después de una compra.",
    trigger: "post_purchase",
    triggerKeywords: [],
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    steps: [
      {
        id: "thanks",
        type: "message",
        content: "¡Gracias por tu compra! 🎉 ¿Cómo fue tu experiencia?",
        nextStep: "rating",
      },
      {
        id: "rating",
        type: "question",
        content: "Califica tu experiencia",
        options: ["Excelente", "Buena", "Necesita mejora"],
        optionConnections: {
          0: "excellent",
          1: "good",
          2: "improve",
        },
      },
      {
        id: "excellent",
        type: "message",
        content: "¡Excelente! Aquí va un cupón de 10% para tu próxima compra: GRACIAS10",
      },
      {
        id: "good",
        type: "message",
        content: "¡Gracias por tu feedback! Seguiremos mejorando.",
      },
      {
        id: "improve",
        type: "message",
        content: "Lamentamos que no haya sido perfecto. Conectándote con soporte...",
      },
    ],
    stats: {
      totalTriggers: 56,
      completionRate: 64,
      averageTime: 180,
    },
  },
];

export const getMockFlowById = (flowId: string) =>
  mockFlowTemplates.find((flow) => flow.id === flowId);

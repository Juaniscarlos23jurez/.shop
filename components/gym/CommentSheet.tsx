"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Star, MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function CommentSheet({ isOpen, onClose, companyId }: CommentSheetProps) {
  const [comment, setComment] = useState('');
  const [selectedType, setSelectedType] = useState('Sugerencia');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (isSending) return;
    if (comment.trim().length === 0) {
      setError('Escribe un comentario antes de enviar.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        throw new Error('No estás autenticado. Por favor inicia sesión.');
      }

      const response = await fetch(
        `https://laravel-pkpass-backend-development-pfaawl.laravel.cloud/api/client/auth/companies/${companyId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: selectedType,
            comment: comment.trim(),
            rating: selectedRating > 0 ? selectedRating : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el comentario');
      }

      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido enviado exitosamente.",
      });

      onClose();
      setComment('');
      setSelectedRating(0);
      setSelectedType('Sugerencia');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el comentario');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-zinc-900 border-t border-zinc-800 w-full max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="p-8 pb-10">
          {/* Handle */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              Feedback Atleta
            </h2>
          </div>
          <p className="text-base text-zinc-500 mb-8 font-medium">
            Tu opinión nos ayuda a forjar un mejor centro de entrenamiento.
          </p>

          {/* Type Selector */}
          <div className="mb-6">
            <label className="text-xs font-black text-zinc-400 mb-2 block uppercase tracking-widest">
              Naturaleza del Reporte
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full rounded-2xl bg-zinc-950 border-zinc-800 h-14 text-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl">
                <SelectItem value="Sugerencia">Sugerencia (Level Up)</SelectItem>
                <SelectItem value="Queja">Reportar Problema</SelectItem>
                <SelectItem value="Felicitación">Gran Sesión</SelectItem>
                <SelectItem value="Otro">Otros Asuntos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <label className="text-xs font-black text-zinc-400 mb-3 block uppercase tracking-widest">
              Califica tu Experiencia
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    size={36}
                    className={selectedRating >= rating ? 'fill-blue-500 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-zinc-800'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-8">
            <Textarea
              placeholder="Escribe tu reporte aquí... ¿Qué podemos mejorar en tu entrenamiento?"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError(null);
              }}
              rows={5}
              className="resize-none rounded-[1.5rem] bg-zinc-950 border-zinc-800 text-white p-4 font-medium focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
            {error && (
              <p className="text-sm text-red-500 mt-2 font-bold uppercase tracking-tight">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-2xl h-16 border-2 border-zinc-800 bg-zinc-950 text-zinc-500 font-black uppercase tracking-widest hover:text-white hover:bg-zinc-900"
              disabled={isSending}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 rounded-2xl h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
              disabled={isSending}
            >
              {isSending ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enviar Reporte'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

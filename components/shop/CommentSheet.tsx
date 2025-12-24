"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Star } from 'lucide-react';
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
      // Get the authentication token from localStorage
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-5">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Enviar comentario
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Selecciona el tipo de comentario y cuéntanos tu experiencia.
          </p>

          {/* Type Selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Tipo de comentario
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sugerencia">Sugerencia</SelectItem>
                <SelectItem value="Queja">Queja</SelectItem>
                <SelectItem value="Felicitación">Felicitación</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Calificación (opcional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    className={selectedRating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              className="resize-none rounded-xl"
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl h-12"
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 rounded-xl h-12"
              disabled={isSending}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

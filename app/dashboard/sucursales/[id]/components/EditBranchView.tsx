'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Branch } from '@/types/branch';
import { BranchForm } from './BranchForm';

interface EditBranchViewProps {
  branch: Branch;
  onSave: (branch: Branch) => Promise<void>;
  onCancel: () => void;
}

export function EditBranchView({ branch, onSave, onCancel }: EditBranchViewProps) {
  const router = useRouter();

  // Handle save and redirect
  const handleSave = async (updatedBranch: Branch) => {
    try {
      await onSave(updatedBranch);
      // Remove edit=true from URL after successful save
      router.replace(`/dashboard/sucursales/${branch.id}`);
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  // Handle cancel and update URL
  const handleCancel = () => {
    onCancel();
    // Remove edit=true from URL
    router.replace(`/dashboard/sucursales/${branch.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Editar sucursal</h2>
        <Button 
          variant="outline" 
          onClick={handleCancel}
        >
          Cancelar
        </Button>
      </div>
      <BranchForm 
        branch={branch}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}

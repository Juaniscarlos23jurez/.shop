'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Branch, Employee } from '@/types/branch';
import { 
  BranchInfo, 
  EmployeeList, 
  EmployeeForm, 
  BranchStats, 
  QuickActions
} from './index';
import { AccountForm } from './AccountForm';

interface BranchShowViewProps {
  branch: Branch;
  employees: Employee[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEditClick: () => void;
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
  onManageAccount: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  showEmployeeForm: boolean;
  showAccountForm: boolean;
  currentEmployee: Employee | null;
  onSaveEmployee: (data: any) => Promise<void>;
  onSaveAccount: (data: any) => Promise<void>;
  onCancelEmployeeForm: () => void;
  onCancelAccountForm: () => void;
  locationId: string;
}

export function BranchShowView({
  branch,
  employees,
  activeTab,
  onTabChange,
  onEditClick,
  onAddEmployee,
  onEditEmployee,
  onManageAccount,
  onDeleteEmployee,
  showEmployeeForm,
  showAccountForm,
  currentEmployee,
  onSaveEmployee,
  onSaveAccount,
  onCancelEmployeeForm,
  onCancelAccountForm,
  locationId,
}: BranchShowViewProps) {
  const router = useRouter();

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/sucursales')} 
          className="flex items-center"
        >
          <span className="mr-2">←</span>
          Ver todas las sucursales
        </Button>
      </div>

      <BranchInfo 
        branch={branch} 
        onEditClick={onEditClick}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              onTabChange(value);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.set('tab', value);
              window.history.replaceState({}, '', newUrl.toString());
            }} 
            className="space-y-4"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="employees">Empleados</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>

            <TabsContent value="employees">
              {showAccountForm ? (
                <AccountForm
                  account={currentEmployee?.account}
                  employeeId={currentEmployee?.id || ''}
                  employeeName={currentEmployee?.name || ''}
                  locationId={locationId}
                  onSave={onSaveAccount}
                  onCancel={onCancelAccountForm}
                />
              ) : showEmployeeForm ? (
                <EmployeeForm
                  employee={currentEmployee}
                  locationId={locationId}
                  onSave={onSaveEmployee}
                  onCancel={onCancelEmployeeForm}
                />
              ) : (
                <EmployeeList
                  employees={employees}
                  onAddEmployee={onAddEmployee}
                  onEditEmployee={onEditEmployee}
                  onManageAccount={onManageAccount}
                  onDeleteEmployee={onDeleteEmployee}
                />
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la sucursal</CardTitle>
                  <CardDescription>
                    Configura las opciones avanzadas de esta sucursal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configuración avanzada de la sucursal.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <QuickActions />
          <BranchStats branch={branch} employees={employees} />
        </div>
      </div>
    </>
  );
}

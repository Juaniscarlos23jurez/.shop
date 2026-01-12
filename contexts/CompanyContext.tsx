'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api/api';

interface Company {
    id: number;
    name: string;
    slug?: string;
    company_plan_id?: number | string;
    plan?: {
        plan_id: number | string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface CompanyContextType {
    company: Company | null;
    loading: boolean;
    refreshCompany: () => Promise<void>;
    getPlanName: () => string;
}

export const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompany = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.userCompanies.get(token);
            if (response.success && response.data) {
                // Adjust based on common API response patterns seen in the codebase
                const companyData = response.data.data || response.data;
                setCompany(companyData);
            }
        } catch (error) {
            console.error('Error fetching company context:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompany();
    }, [token]);

    const getPlanName = () => {
        if (!company) return '';

        // Try to get name directly from API objects first
        const directName = company.company_plan?.name || company.plan?.details?.name;
        if (directName) return directName;

        const planId = company.company_plan_id || company.plan?.plan_id;

        if (planId === null || planId === undefined) return "Básico";
        const idStr = String(planId);
        if (idStr === "1") return "Basic";
        if (idStr === "2") return "Premium";
        if (idStr === "3") return "Business";

        return "Personalizado";
    };

    return (
        <CompanyContext.Provider value={{
            company,
            loading,
            refreshCompany: fetchCompany,
            getPlanName
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
}

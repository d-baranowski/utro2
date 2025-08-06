'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organisation } from '@/generated/organisation/v1/organisation_pb';
import { organisationApi } from '@/lib/api/organisation';
import { useAuth } from './AuthContext';

interface OrganisationContextType {
  organisations: Organisation[];
  currentOrganisation: Organisation | null;
  loading: boolean;
  error: string | null;
  fetchOrganisations: () => Promise<void>;
  selectOrganisation: (org: Organisation) => void;
  createOrganisation: (name: string, description?: string) => Promise<Organisation>;
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

export function OrganisationProvider({ children }: { children: ReactNode }) {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [currentOrganisation, setCurrentOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchOrganisations = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const orgs = await organisationApi.getMyOrganisations();
      setOrganisations(orgs);

      // If user has organisations but none selected, select the first one
      if (orgs.length > 0 && !currentOrganisation) {
        const savedOrgId = localStorage.getItem('selectedOrganisationId');
        const savedOrg = orgs.find((org: Organisation) => org.id === savedOrgId);
        setCurrentOrganisation(savedOrg || orgs[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organisations');
      console.error('Failed to fetch organisations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectOrganisation = (org: Organisation) => {
    setCurrentOrganisation(org);
    localStorage.setItem('selectedOrganisationId', org.id);
  };

  const createOrganisation = async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const newOrg = await organisationApi.createOrganisation(name, description);
      await fetchOrganisations(); // Refresh the list
      return newOrg;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organisation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganisations();
    } else {
      setOrganisations([]);
      setCurrentOrganisation(null);
    }
  }, [isAuthenticated]);

  return (
    <OrganisationContext.Provider
      value={{
        organisations,
        currentOrganisation,
        loading,
        error,
        fetchOrganisations,
        selectOrganisation,
        createOrganisation,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
}

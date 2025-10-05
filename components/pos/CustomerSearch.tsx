import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from 'lucide-react';
import { Customer } from '@/types/customer';
import { api } from '@/lib/api/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
  onClear: () => void;
  selectedCustomer: Customer | null;
}

export function CustomerSearch({ onSelect, onClear, selectedCustomer }: CustomerSearchProps) {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allFollowers, setAllFollowers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all followers when component mounts
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!token) {
        console.log('CustomerSearch: No token available');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('CustomerSearch: Fetching followers...');
        const response = await api.userCompanies.getFollowers(token);
        console.log('CustomerSearch: API Response:', response);
        
        // La API devuelve response.data.data.followers (doble anidación)
        const apiData = response.data as any;
        const followersData = apiData?.data?.followers || apiData?.followers;
        
        if (response.success && followersData && Array.isArray(followersData)) {
          console.log('CustomerSearch: Followers found:', followersData);
          const mappedCustomers: Customer[] = followersData.map((follower: {
            customer_id: number;
            customer_name: string;
            customer_email: string;
            customer_phone?: string;
          }) => ({
            id: follower.customer_id.toString(),
            name: follower.customer_name,
            email: follower.customer_email,
            phone: follower.customer_phone,
            points: 0,
          }));
          console.log('CustomerSearch: Mapped customers:', mappedCustomers);
          setAllFollowers(mappedCustomers);
          setCustomers(mappedCustomers);
        } else {
          console.log('CustomerSearch: No followers in response or unsuccessful');
        }
      } catch (error) {
        console.error('CustomerSearch: Error fetching followers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
  }, [token]);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allFollowers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      );
      setCustomers(filtered);
    } else {
      setCustomers(allFollowers);
    }
  }, [searchQuery, allFollowers]);

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  return (
    <div className="relative w-full">
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-secondary">
          <div>
            <p className="font-medium">{selectedCustomer.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCustomer.phone} • {selectedCustomer.points} puntos
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClear}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              Buscar cliente...
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command shouldFilter={false}>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Buscar por nombre, teléfono o correo..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <CommandList>
                {isLoading ? (
                  <div className="py-6 text-center text-sm">Cargando clientes...</div>
                ) : customers.length === 0 ? (
                  <div className="py-6 text-center text-sm">
                    <p>No se encontraron clientes</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total cargados: {allFollowers.length}
                    </p>
                  </div>
                ) : (
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => handleSelect(customer)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col w-full">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {customer.email} {customer.phone && `• ${customer.phone}`}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

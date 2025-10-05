export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  points: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface LoyaltyTransaction {
  customerId: string;
  orderId: string;
  pointsEarned: number;
  total: number;
  date: string;
}

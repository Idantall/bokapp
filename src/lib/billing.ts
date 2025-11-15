// Billing Module - Stub for In-App Purchases
// This module abstracts the billing logic for future integration with
// App Store, Play Store, or services like RevenueCat

export type ProductId = 'premium_monthly' | 'premium_yearly';

export interface Product {
  id: ProductId;
  price: string;
  currency: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: ProductId;
  transactionId?: string;
  error?: string;
}

// Stub: Get available products
export async function getProducts(): Promise<Product[]> {
  // TODO: Integrate with expo-in-app-purchases or RevenueCat
  return [
    {
      id: 'premium_monthly',
      price: '$9.99',
      currency: 'USD',
      title: 'Premium Monthly',
      description: 'Unlock all features with Premium',
    },
  ];
}

// Stub: Purchase a product
export async function purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
  // TODO: Integrate with expo-in-app-purchases or RevenueCat
  console.log(`[STUB] Purchasing ${productId}`);
  
  return {
    success: false,
    error: 'Billing not yet implemented. Integrate with App Store/Play Store.',
  };
}

// Stub: Restore purchases
export async function restorePurchases(): Promise<PurchaseResult[]> {
  // TODO: Integrate with expo-in-app-purchases or RevenueCat
  console.log('[STUB] Restoring purchases');
  
  return [];
}

// Stub: Check if user has active subscription
export async function hasActiveSubscription(): Promise<boolean> {
  // TODO: Check with billing provider
  // For now, check Supabase user.plan field
  return false;
}


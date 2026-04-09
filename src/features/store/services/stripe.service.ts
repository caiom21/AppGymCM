import { 
  initPaymentSheet, 
  presentPaymentSheet 
} from '@stripe/stripe-react-native';
import { supabase } from '../../../shared/lib/supabase';

export class StripeService {
  static async initializeCheckout(amount: number, currency: string = 'brl') {
    try {
      // 1. Call your edge function to create a payment intent
      // For v3 MVP placeholder, we simulate a successful init
      console.log(`Initializing Stripe Checkout: ${amount} ${currency}`);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, currency }
      });

      if (error) throw error;

      const { paymentIntent, ephemeralKey, customer } = data;

      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'GymOS Platform',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Atleta GymOS',
        },
      });

      if (sheetError) throw sheetError;
      return { success: true };
    } catch (e) {
      console.error('Stripe Init Error:', e);
      return { success: false, error: e };
    }
  }

  static async openPaymentSheet() {
    const { error } = await presentPaymentSheet();
    if (error) {
      console.log('Payment failed:', error);
      return { success: false, error };
    }
    return { success: true };
  }
}

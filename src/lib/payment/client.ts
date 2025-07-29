import { loadScript } from '@/lib/utils';

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  ref: string;
  callback: (response: any) => void;
  onClose: () => void;
  currency?: string;
  metadata?: Record<string, any>;
}

interface FlutterwaveOptions {
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
}

export class PaymentClient {
  private paystackKey: string;
  private flutterwaveKey: string;

  constructor(paystackKey: string, flutterwaveKey: string) {
    this.paystackKey = paystackKey;
    this.flutterwaveKey = flutterwaveKey;
  }

  async initializePaystack(options: Omit<PaystackOptions, 'key'>): Promise<void> {
    try {
      // Load Paystack script
      await loadScript('https://js.paystack.co/v1/inline.js');
      
      const paystackOptions: PaystackOptions = {
        key: this.paystackKey,
        ...options
      };

      // @ts-ignore - Paystack adds this to window
      const handler = window.PaystackPop.setup(paystackOptions);
      handler.openIframe();
    } catch (error) {
      console.error('Error loading Paystack:', error);
      throw new Error('Payment initialization failed. Please try again.');
    }
  }

  async initializeFlutterwave(options: Omit<FlutterwaveOptions, 'public_key'>): Promise<void> {
    try {
      // Load Flutterwave script
      await loadScript('https://checkout.flutterwave.com/v3.js');
      
      const flutterwaveOptions: FlutterwaveOptions = {
        public_key: this.flutterwaveKey,
        ...options
      };

      // @ts-ignore - Flutterwave adds this to window
      window.FlutterwaveCheckout(flutterwaveOptions);
    } catch (error) {
      console.error('Error loading Flutterwave:', error);
      throw new Error('Payment initialization failed. Please try again.');
    }
  }

  // Determine which payment method to use based on availability and user preference
  async initializePayment(options: {
    email: string;
    amount: number;
    reference: string;
    callback: (response: any) => void;
    onClose: () => void;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { email, amount, reference, callback, onClose, currency = 'NGN', metadata } = options;

    // Try Paystack first
    if (this.paystackKey && this.paystackKey !== 'your_paystack_public_key') {
      try {
        await this.initializePaystack({
          email,
          amount: amount * 100, // Paystack uses kobo
          ref: reference,
          callback,
          onClose,
          currency,
          metadata
        });
        return;
      } catch (error) {
        console.log('Paystack failed, falling back to Flutterwave:', error);
      }
    }

    // Fall back to Flutterwave
    if (this.flutterwaveKey && this.flutterwaveKey !== 'your_flutterwave_public_key') {
      await this.initializeFlutterwave({
        tx_ref: reference,
        amount,
        currency,
        payment_options: 'card,ussd,banktransfer,banktransfer_ng,mobilemoneygh,qr,paga,mobilemoneyfr,mpesa',
        customer: {
          email,
          phonenumber: '',
          name: ''
        },
        customizations: {
          title: 'HouseHelp.ng Payment',
          description: 'Subscription Payment',
          logo: 'https://househelp.ng/logo.png'
        },
        callback,
        onclose: onClose
      });
      return;
    }

    // If neither payment gateway is configured
    throw new Error('No payment gateway configured. Please contact support.');
  }
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
}

export interface RazorpayOrderResponse {
  key: string;
  amount: number; // in the smallest currency unit (e.g., paise for INR)
  currency: string;
  name: string;
  razorpayOrderId: string;
}
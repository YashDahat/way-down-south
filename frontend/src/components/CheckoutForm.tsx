import { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

import { useCreateOrder } from '../hooks/useOrders';
import { CartContext } from '../context/CartContext';
import { CreateOrderRequest, RazorpayOrderResponse } from '../types/order';

declare global {
  interface Window {
    Razorpay: new (options: any) => any;
  }
}

const formSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Phone number is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
});

type FormData = z.infer<typeof formSchema>;

const CheckoutForm = () => {
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    throw new Error('CheckoutForm must be used within a CartProvider');
  }

  const { cartItems, clearCart } = cartContext;
  const { mutate, isPending, error } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = (data: RazorpayOrderResponse) => {
    const { customerName, customerPhone } = getValues();

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Way Down South',
      description: 'Order Payment',
      order_id: data.razorpayOrderId,
      handler: function (_response: any) {
        clearCart();
        navigate('/order-confirmation');
      },
      prefill: {
        name: customerName,
        contact: customerPhone,
      },
      theme: {
        color: '#d4a843',
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      console.error('Razorpay SDK not loaded.');
      alert('Payment gateway not available. Please try again later.');
    }
  };

  const handleError = (err: Error) => {
    console.error('Order creation failed:', err);
    alert(`Order failed: ${err.message}`);
  };

  const onSubmit = (formData: FormData) => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    const orderItems = cartItems.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const payload: CreateOrderRequest = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deliveryAddress: formData.deliveryAddress,
      items: orderItems,
    };

    mutate(payload, {
      onSuccess: handlePayment,
      onError: handleError,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          {...register('customerName')}
          className={clsx({ 'border-red-500': errors.customerName })}
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          {...register('customerPhone')}
          className={clsx({ 'border-red-500': errors.customerPhone })}
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Textarea
          id="deliveryAddress"
          {...register('deliveryAddress')}
          className={clsx({ 'border-red-500': errors.deliveryAddress })}
        />
        {errors.deliveryAddress && (
          <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress.message}</p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#d4a843] hover:bg-[#c0973e] text-white"
        disabled={isPending || cartItems.length === 0}
      >
        {isPending ? 'Processing...' : 'Place Order & Pay'}
      </Button>
    </form>
  );
};

export default CheckoutForm;
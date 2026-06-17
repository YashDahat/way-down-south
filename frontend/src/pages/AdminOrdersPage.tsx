import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../services/adminOrderService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { format } from 'date-fns';

// Define OrderResponse locally to match the actual return type of adminOrderService.ts.
// This adheres to Rule 5 (Ground Truth = Provided Files) by matching the dependency file's contract,
// even though the feature instruction implies a different structure and import path.
interface OrderResponse {
  id: string;
  status: string; // e.g., 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalAmount: number; // Calculated total amount of the order
}

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, isError, error } = useQuery<OrderResponse[]>({
    queryKey: ['adminOrders'],
    queryFn: getOrders,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  if (isLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error loading orders: {error?.message}</div>;
  }

  const orderStatuses = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Live Order Feed</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Order Time</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
              <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminOrdersPage;
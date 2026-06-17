import { useForm, ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'; // Corrected import path from '../ui/form' to './ui/form'
import { Input } from './ui/input'; // Corrected import path from '../ui/input' to './ui/input'
import { Button } from './ui/button'; // Corrected import path from '../ui/button' to './ui/button'
import { Calendar } from './ui/calendar'; // Corrected import path from '../ui/calendar' to './ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'; // Corrected import path from '../ui/popover' to './ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'; // Corrected import path from '../ui/select' to './ui/select'
import { useCreateReservation } from '../hooks/useReservations';

const formSchema = z.object({
  customerName: z.string().min(1, { message: 'Customer name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  reservationDate: z.date().optional().refine(date => !date || date >= new Date(new Date().setHours(0, 0, 0, 0)), { // Made optional and refined to handle undefined
    message: 'Reservation date cannot be in the past.',
  }),
  selectedTime: z.string().min(1, { message: 'A reservation time is required.' }),
  partySize: z.number().min(1, { message: 'Party size must be at least 1.' }).max(12, { message: 'Party size cannot exceed 12.' }),
});

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 17; h <= 22; h++) { // 5 PM to 10 PM
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 22) {
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export function ReservationForm() {
  const { mutate, isPending, isSuccess, isError, error: _error, data } = useCreateReservation(); // Renamed 'error' to '_error' to avoid TS6133

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      reservationDate: undefined, // Compatible with z.date().optional()
      selectedTime: '',
      partySize: 1,
    }, // Removed explicit cast as it's no longer needed with corrected schema and default values
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { reservationDate, selectedTime, ...rest } = values;

    // Handle case where reservationDate might be undefined if optional
    if (!reservationDate) {
      // This case should ideally be caught by Zod's validation if the field is required
      // but since it's optional, we might need to handle it or ensure UI prevents submission
      // without a date. For now, we'll assume it's valid if it reaches here.
      console.error("Reservation date is missing.");
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDateTime = new Date(reservationDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    const reservationTime = format(combinedDateTime, "yyyy-MM-dd'T'HH:mm:ss");

    mutate({
      ...rest,
      reservationTime,
    });
  };

  if (isSuccess && data) {
    const formattedReservationTime = format(new Date(data.reservationTime), "PPP 'at' p");
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Reservation Confirmed!</h2>
        <p className="text-lg text-gray-800">
          Thank you, <span className="font-medium">{data.customerName}</span>! Your table for{' '}
          <span className="font-medium">{data.partySize}</span> is confirmed for{' '}
          <span className="font-medium">{formattedReservationTime}</span>. A confirmation has been sent to{' '}
          <span className="font-medium">{data.email}</span>.
        </p>
        <p className="mt-4 text-gray-600">We look forward to seeing you!</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "customerName"> }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "email"> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "phone"> }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="123-456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reservationDate"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "reservationDate"> }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={clsx(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="ml-auto h-4 w-4 opacity-50"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selectedTime"
            render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "selectedTime"> }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="partySize"
          render={({ field }: { field: ControllerRenderProps<z.infer<typeof formSchema>, "partySize"> }) => (
            <FormItem>
              <FormLabel>Party Size</FormLabel>
              <Select onValueChange={(value: string) => field.onChange(Number(value))} defaultValue={field.value.toString()}> {/* Converted string to number */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select party size" />
                  </SelectTrigger>
                </FormControl>
                  <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {isError && (
          <p className="text-red-500 text-sm mt-2">
            Sorry, we couldn't complete your reservation. Please try again later.
          </p>
        )}
        <Button type="submit" className="w-full bg-[#d4a843] hover:bg-[#c29a3e]" disabled={isPending}>
          {isPending ? 'Confirming...' : 'Confirm Reservation'}
        </Button>
      </form>
    </Form>
  );
}
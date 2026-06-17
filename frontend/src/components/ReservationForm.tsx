import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';

import { useCreateReservation } from '../hooks/useReservations';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod schema for form validation
const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required."),
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().min(1, "Phone number is required."),
  date: z.date({
    required_error: "A reservation date is required.",
  }).min(new Date(new Date().setHours(0, 0, 0, 0)), "Reservation date must be today or in the future."),
  time: z.string().min(1, "Reservation time is required."),
  partySize: z.coerce.number().min(1, "Party size must be at least 1.").max(12, "Party size cannot exceed 12."),
});

type ReservationFormValues = z.infer<typeof formSchema>;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 17; hour <= 22; hour++) { // 5 PM to 10 PM
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const time12 = format(new Date(2000, 0, 1, hour, minute), 'hh:mm a'); // Use a dummy date for formatting
      slots.push({ value: time24, label: time12 });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();
const partySizeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const ReservationForm: React.FC = () => {
  const { mutate, isPending, isSuccess, isError, error, data } = useCreateReservation();

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      date: undefined,
      time: "",
      partySize: 1,
    },
  });

  const onSubmit = (values: ReservationFormValues) => {
    const datePart = format(values.date, 'yyyy-MM-dd');
    const reservationTime = `${datePart}T${values.time}:00`;

    mutate({
      customerName: values.customerName,
      email: values.email,
      phone: values.phone,
      reservationTime: reservationTime,
      partySize: values.partySize,
    });
  };

  if (isSuccess && data) {
    const formattedReservationTime = format(parseISO(data.reservationTime), "MMMM dd, yyyy 'at' hh:mm a");
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Reservation Confirmed!</h2>
        <p className="text-lg text-gray-800">
          Thank you, <span className="font-medium">{data.customerName}</span>! Your table for <span className="font-medium">{data.partySize}</span> is confirmed for <span className="font-medium">{formattedReservationTime}</span>.
          A confirmation has been sent to <span className="font-medium">{data.email}</span>.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
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
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Party Size</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select party size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partySizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isError && (
          <p className="text-red-600 text-sm mt-2">
            Sorry, we couldn't complete your reservation. Please try again later.
          </p>
        )}

        <Button type="submit" className="w-full bg-[#d4a843]" disabled={isPending}>
          {isPending ? "Confirming..." : "Confirm Reservation"}
        </Button>
      </form>
    </Form>
  );
};

export default ReservationForm;
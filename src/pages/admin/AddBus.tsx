
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the form schema
const busFormSchema = z.object({
  bus_number: z.string().min(2, { message: "Bus number is required" }),
  bus_capacity: z.coerce.number().min(1, { message: "Bus capacity must be at least 1" }),
  rfid_id: z.string().min(2, { message: "RFID ID is required" }),
  driver_id: z.string().optional(),
  driver_name: z.string().min(2, { message: "Driver name is required" }),
  driver_phone: z.string().min(5, { message: "Driver phone is required" }),
  start_point: z.string().min(2, { message: "Start point is required" }),
  via: z.string().optional(),
  stops: z.array(
    z.object({
      location: z.string().min(1, { message: "Location is required" }),
      time: z.string().min(1, { message: "Time is required" })
    })
  ).min(1, { message: "At least one stop is required" }),
});

type BusFormValues = z.infer<typeof busFormSchema>;

// Define the Driver type
type Driver = {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  bus_number: string | null;
};

const AddBus = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const form = useForm<BusFormValues>({
    resolver: zodResolver(busFormSchema),
    defaultValues: {
      bus_number: "",
      bus_capacity: 0,
      rfid_id: "",
      driver_id: "",
      driver_name: "",
      driver_phone: "",
      start_point: "",
      via: "",
      stops: [
        { location: "", time: "" }
      ],
    },
  });

  // Setup field array for dynamic stops
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  // Fetch available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'driver');
          
        if (error) throw error;
        setDrivers(data || []);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load drivers. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, [toast]);

  // Handle driver selection
  const handleDriverChange = (driverId: string) => {
    const selectedDriver = drivers.find(driver => driver.id === driverId);
    if (selectedDriver) {
      form.setValue("driver_name", selectedDriver.username);
      form.setValue("driver_phone", selectedDriver.phone_number);
    }
  };

  // Form submission handler
  const onSubmit = async (values: BusFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting bus form:", values);
      
      // Insert into bus_details table
      const { data: busData, error: busError } = await supabase
        .from('bus_details')
        .insert({
          bus_number: values.bus_number,
          bus_capacity: values.bus_capacity, // This is now correctly a number
          rfid_id: values.rfid_id,
          driver_name: values.driver_name,
          driver_phone: values.driver_phone,
          start_point: values.start_point,
          in_campus: false,
        });
        
      if (busError) throw busError;
      
      // Insert into bus_routes table
      const { data: routeData, error: routeError } = await supabase
        .from('bus_routes')
        .insert({
          route_no: values.bus_number, // Using bus number as route number
          bus_number: values.bus_number,
          rfid_id: values.rfid_id,
          via: values.via || null,
          stops: values.stops,
        });
        
      if (routeError) throw routeError;
      
      // Update driver's bus_number if a driver was selected
      if (values.driver_id) {
        const { error: driverError } = await supabase
          .from('profiles')
          .update({ bus_number: values.bus_number })
          .eq('id', values.driver_id);
          
        if (driverError) throw driverError;
      }
      
      toast({
        title: 'Success',
        description: `Bus ${values.bus_number} has been added successfully.`,
      });
      
      // Navigate back to buses list
      navigate('/admin/buses');
      
    } catch (error: any) {
      console.error('Error adding bus:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bus. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Add New Bus" role="admin" currentPath="/admin/buses">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Add New Bus</CardTitle>
            <CardDescription>
              Enter the details for the new bus. All fields except Via are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bus Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bus Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="bus_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bus Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., BUS001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bus_capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bus Capacity*</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="e.g., 40" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rfid_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RFID ID*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., RFID001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Driver Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Driver Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="driver_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Driver (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDriverChange(value);
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a driver" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {drivers.map(driver => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.username} {driver.bus_number ? `(Assigned to ${driver.bus_number})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecting a driver will fill in the name and phone automatically.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="driver_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="driver_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driver Phone*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 555-123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Route Details Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Route Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_point"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Point*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Campus" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="via"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Via (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Downtown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Stops (Dynamic) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Stops*</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ location: '', time: '' })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Stop
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end space-x-2">
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`stops.${index}.location`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <FormLabel className="text-xs">Location</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="e.g., Library" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <FormField
                              control={form.control}
                              name={`stops.${index}.time`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <FormLabel className="text-xs">Time</FormLabel>
                                  </div>
                                  <FormControl>
                                    <Input placeholder="e.g., 9:00 AM" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="flex-shrink-0 mb-2"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/admin/buses')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bus-gradient-bg"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Bus'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddBus;

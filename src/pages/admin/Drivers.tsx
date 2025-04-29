
import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Phone, Mail, Truck, Eye, Pencil, Trash2, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the Driver type
type Driver = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'driver';
  bus_number: string | null;
  phone_number: string;
  created_at: string;
  last_login: string | null;
};

// Define the Bus type (simplified for selection)
type Bus = {
  bus_number: string;
  rfid_id: string;
};

// Define the form schema using Zod
const driverFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  phone: z.string().min(5, { message: "Please enter a valid phone number." }),
  bus_number: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Initialize react-hook-form
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      phone: "",
      bus_number: "",
    },
  });

  // Fetch drivers data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'driver');

        if (driversError) throw driversError;

        // Fetch buses for the add driver form
        const { data: busesData, error: busesError } = await supabase
          .from('bus_details')
          .select('bus_number, rfid_id');

        if (busesError) throw busesError;

        // Process the data
        setDrivers(driversData || []);
        setBuses(busesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(driver => 
    driver.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (driver.bus_number && driver.bus_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    driver.phone_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle expanded driver row
  const toggleExpand = (driverId: string) => {
    setExpandedDriver(expandedDriver === driverId ? null : driverId);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <DashboardLayout title="Driver Management" role="admin" currentPath="/admin/drivers">
      <div className="container mx-auto py-6">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Drivers</CardTitle>
              <CardDescription>
                Manage all bus drivers and their details
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                placeholder="Search by name, email, phone number, or bus number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No drivers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'There are no drivers registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Bus Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <React.Fragment key={driver.id}>
                        <TableRow>
                          <TableCell className="font-medium">{driver.username}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.phone_number}</TableCell>
                          <TableCell>
                            {driver.bus_number ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {driver.bus_number}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(driver.id)}
                            >
                              {expandedDriver === driver.id ? "Hide Details" : "View Details"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedDriver === driver.id && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="bg-muted/50 p-4 rounded-lg m-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-2">Account Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center">
                                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="font-medium w-32">Username:</span>
                                        <span>{driver.username}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="font-medium w-32">Email:</span>
                                        <span>{driver.email}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="font-medium w-32">Phone:</span>
                                        <span>{driver.phone_number}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="font-medium w-32">Bus Number:</span>
                                        <span>{driver.bus_number || 'Not assigned'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Additional Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">Created At:</span>
                                        <span>{formatDate(driver.created_at)}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">Last Login:</span>
                                        <span>{formatDate(driver.last_login)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <Button variant="outline" size="sm" className="mr-2">
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Drivers;

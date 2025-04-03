
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

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

  // Handle form submission for adding a new driver
  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extract values
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const busNumber = formData.get('bus_number') as string || null;
    
    // Validate form
    if (!email || !username || !password || !phone) {
      toast({
        title: 'Validation Error',
        description: 'All fields except Bus Number are required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'driver',
            phone_number: phone,
            bus_number: busNumber,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Driver ${username} has been added. An email verification link has been sent.`,
      });
      
      // Fetch the updated list of drivers
      const { data: updatedDrivers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver');
        
      if (updatedDrivers) {
        setDrivers(updatedDrivers);
      }
      
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding driver:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add driver. Please try again.',
        variant: 'destructive',
      });
    }
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bus-gradient-bg">
                  <Plus className="h-4 w-4 mr-2" /> Add New Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Driver</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new driver. All fields except Bus Number are required.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDriver}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="driver@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" placeholder="e.g., JohnDoe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" placeholder="Temporary password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" placeholder="e.g., 555-123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus_number">Assigned Bus (Optional)</Label>
                      <Select name="bus_number">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {buses.map(bus => (
                            <SelectItem key={bus.rfid_id} value={bus.bus_number}>
                              {bus.bus_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Driver</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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

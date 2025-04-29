import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Search, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatErrorMessage, logError } from '@/utils/errorHandlers';

// Define the Driver type
type Driver = {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  bus_number: string | null;
  last_login: string | null;
  created_at: string;
};

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch drivers
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDrivers(data || []);
      setFilteredDrivers(data || []);
    } catch (error) {
      logError('FetchDrivers', error);
      toast({
        title: 'Error',
        description: formatErrorMessage(error) || 'Failed to load drivers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDrivers(drivers);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = drivers.filter(
      driver => 
        driver.username.toLowerCase().includes(term) ||
        driver.email.toLowerCase().includes(term) ||
        driver.phone_number.toLowerCase().includes(term) ||
        (driver.bus_number && driver.bus_number.toLowerCase().includes(term))
    );
    
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDrivers();
    setIsRefreshing(false);
  };

  // Handle delete
  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', driverToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Driver ${driverToDelete.username} has been deleted`,
      });
      
      // Refresh the list
      fetchDrivers();
    } catch (error) {
      logError('DeleteDriver', error);
      toast({
        title: 'Error',
        description: formatErrorMessage(error) || 'Failed to delete driver',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDriverToDelete(null);
    }
  };

  return (
    <DashboardLayout title="Drivers" role="admin" currentPath="/admin/drivers">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search drivers..."
                className="pl-8 w-[250px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <Button onClick={() => navigate('/admin/add-driver')}>
            <Plus className="h-4 w-4 mr-2" /> Add Driver
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Bus</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading drivers...
                  </TableCell>
                </TableRow>
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'No drivers match your search' : 'No drivers found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.username}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phone_number}</TableCell>
                    <TableCell>
                      {driver.bus_number ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {driver.bus_number}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {driver.last_login ? new Date(driver.last_login).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/edit-driver/${driver.id}`)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(driver)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete driver {driverToDelete?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Drivers;

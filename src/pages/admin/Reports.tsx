import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Filter, Search, MessageSquare, ThumbsUp, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

enum FeedbackType {
  Complaint = 'complaint',
  Suggestion = 'suggestion',
  Appreciation = 'appreciation'
}

enum FeedbackStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Resolved = 'resolved',
  Closed = 'closed'
}

interface Feedback {
  id: number;
  name: string;
  email: string;
  bus_number: string | null;
  feedback_type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const Reports = () => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(FeedbackStatus.Pending);

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchQuery, typeFilter, statusFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the raw data to match our Feedback interface
      const typedFeedback: Feedback[] = (data || []).map(item => ({
        ...item,
        feedback_type: item.feedback_type as FeedbackType,
        status: item.status as FeedbackStatus
      }));
      
      setFeedback(typedFeedback);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load feedback data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = [...feedback];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        (item.bus_number && item.bus_number.toLowerCase().includes(query))
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.feedback_type === typeFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredFeedback(filtered);
  };

  const handleViewFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setAdminNotes(item.admin_notes || '');
    setFeedbackStatus(item.status as FeedbackStatus);
    setFeedbackDialogOpen(true);
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          status: feedbackStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedFeedback.id);
        
      if (error) throw error;
      
      // Update the local state
      setFeedback(prev => prev.map(item => 
        item.id === selectedFeedback.id
          ? { ...item, status: feedbackStatus, admin_notes: adminNotes, updated_at: new Date().toISOString() }
          : item
      ));
      
      setFeedbackDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Feedback status updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update feedback status',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Feedback Reports" role="admin" currentPath="/admin/reports">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Management
            </CardTitle>
            <CardDescription>
              View and manage user feedback, complaints, and suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="w-40">
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => setTypeFilter(value as FeedbackType | 'all')}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value={FeedbackType.Complaint}>Complaints</SelectItem>
                        <SelectItem value={FeedbackType.Suggestion}>Suggestions</SelectItem>
                        <SelectItem value={FeedbackType.Appreciation}>Appreciation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-40">
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as FeedbackStatus | 'all')}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={FeedbackStatus.Pending}>Pending</SelectItem>
                        <SelectItem value={FeedbackStatus.InProgress}>In Progress</SelectItem>
                        <SelectItem value={FeedbackStatus.Resolved}>Resolved</SelectItem>
                        <SelectItem value={FeedbackStatus.Closed}>Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Feedback list */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredFeedback.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Bus No.</TableHead>
                        <TableHead className="hidden lg:table-cell">Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.feedback_type === FeedbackType.Complaint && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Complaint
                              </Badge>
                            )}
                            {item.feedback_type === FeedbackType.Suggestion && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Suggestion
                              </Badge>
                            )}
                            {item.feedback_type === FeedbackType.Appreciation && (
                              <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                Appreciation
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{item.bus_number || 'N/A'}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {item.status === FeedbackStatus.Pending && (
                              <Badge className="bg-yellow-500">Pending</Badge>
                            )}
                            {item.status === FeedbackStatus.InProgress && (
                              <Badge className="bg-blue-500">In Progress</Badge>
                            )}
                            {item.status === FeedbackStatus.Resolved && (
                              <Badge className="bg-green-500">Resolved</Badge>
                            )}
                            {item.status === FeedbackStatus.Closed && (
                              <Badge variant="outline">Closed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFeedback(item)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <div className="flex justify-center">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium">No feedback found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                      ? "Try adjusting your search or filter criteria"
                      : "There is no feedback submitted yet"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback detail dialog */}
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedFeedback?.feedback_type === FeedbackType.Complaint && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {selectedFeedback?.feedback_type === FeedbackType.Suggestion && (
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                )}
                {selectedFeedback?.feedback_type === FeedbackType.Appreciation && (
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                )}
                <span>
                  {selectedFeedback?.feedback_type.charAt(0).toUpperCase() + selectedFeedback?.feedback_type.slice(1) || ''} Details
                </span>
              </DialogTitle>
              <DialogDescription>
                Submitted on {selectedFeedback ? new Date(selectedFeedback.created_at).toLocaleString() : ''}
              </DialogDescription>
            </DialogHeader>

            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Name</div>
                    <div>{selectedFeedback.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div>{selectedFeedback.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Bus Number</div>
                    <div>{selectedFeedback.bus_number || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <Select
                      value={feedbackStatus}
                      onValueChange={(value) => setFeedbackStatus(value as FeedbackStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FeedbackStatus.Pending}>Pending</SelectItem>
                        <SelectItem value={FeedbackStatus.InProgress}>In Progress</SelectItem>
                        <SelectItem value={FeedbackStatus.Resolved}>Resolved</SelectItem>
                        <SelectItem value={FeedbackStatus.Closed}>Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Message</div>
                  <div className="p-3 border rounded-md bg-secondary">
                    {selectedFeedback.message}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Admin Notes</div>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="h-24"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateFeedback}>
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

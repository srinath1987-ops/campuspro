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
      
      setFeedback(data || []);
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
      
      toast({
        title: 'Success',
        description: 'Feedback has been updated',
      });
      
      setFeedbackDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update feedback',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.Pending:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/30">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>;
      case FeedbackStatus.InProgress:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800/30">
          <AlertCircle className="mr-1 h-3 w-3" /> In Progress
        </Badge>;
      case FeedbackStatus.Resolved:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800/30">
          <CheckCircle className="mr-1 h-3 w-3" /> Resolved
        </Badge>;
      case FeedbackStatus.Closed:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200 border-gray-200 dark:border-gray-700">
          Closed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.Complaint:
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800/30">
          <AlertTriangle className="mr-1 h-3 w-3" /> Complaint
        </Badge>;
      case FeedbackType.Suggestion:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800/30">
          <MessageSquare className="mr-1 h-3 w-3" /> Suggestion
        </Badge>;
      case FeedbackType.Appreciation:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800/30">
          <ThumbsUp className="mr-1 h-3 w-3" /> Appreciation
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <DashboardLayout title="Reports & Feedback" role="admin" currentPath="/admin/reports">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>User Feedback</CardTitle>
            <CardDescription>
              Manage and respond to feedback submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters and search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value as FeedbackType | 'all')}
                  >
                    <SelectTrigger className="w-40">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={FeedbackType.Complaint}>Complaints</SelectItem>
                      <SelectItem value={FeedbackType.Suggestion}>Suggestions</SelectItem>
                      <SelectItem value={FeedbackType.Appreciation}>Appreciations</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as FeedbackStatus | 'all')}
                  >
                    <SelectTrigger className="w-40">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={FeedbackStatus.Pending}>Pending</SelectItem>
                      <SelectItem value={FeedbackStatus.InProgress}>In Progress</SelectItem>
                      <SelectItem value={FeedbackStatus.Resolved}>Resolved</SelectItem>
                      <SelectItem value={FeedbackStatus.Closed}>Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Table of feedback */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Type</TableHead>
                      <TableHead>Name / Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-40">Date</TableHead>
                      <TableHead className="w-20 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading feedback data...
                        </TableCell>
                      </TableRow>
                    ) : filteredFeedback.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No feedback found. {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your filters.' : ''}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{getTypeBadge(item.feedback_type as FeedbackType)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.email}</div>
                            {item.bus_number && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Bus: {item.bus_number}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">{item.message}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status as FeedbackStatus)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(item.created_at)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewFeedback(item)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback detail dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-3xl bg-background dark:bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">Feedback Details</DialogTitle>
            <DialogDescription>
              View and manage the feedback from {selectedFeedback?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 mt-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Admin Notes & Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-foreground">Name</h4>
                      <p className="text-foreground">{selectedFeedback.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-foreground">Email</h4>
                      <p className="text-foreground">{selectedFeedback.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-foreground">Type</h4>
                      <div>{getTypeBadge(selectedFeedback.feedback_type as FeedbackType)}</div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-foreground">Bus Number</h4>
                      <p className="text-foreground">{selectedFeedback.bus_number || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-foreground">Date Submitted</h4>
                    <p className="text-foreground">{formatDate(selectedFeedback.created_at)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-foreground">Message</h4>
                    <div className="p-3 border rounded-md bg-muted/50 dark:bg-muted/20 border-border">
                      <p className="whitespace-pre-wrap text-foreground">{selectedFeedback.message}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-foreground">Status</h4>
                    <Select
                      value={feedbackStatus}
                      onValueChange={(value) => setFeedbackStatus(value as FeedbackStatus)}
                    >
                      <SelectTrigger className="bg-background dark:bg-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FeedbackStatus.Pending}>Pending</SelectItem>
                        <SelectItem value={FeedbackStatus.InProgress}>In Progress</SelectItem>
                        <SelectItem value={FeedbackStatus.Resolved}>Resolved</SelectItem>
                        <SelectItem value={FeedbackStatus.Closed}>Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-foreground">Admin Notes</h4>
                    <Textarea
                      placeholder="Add notes about this feedback (only visible to admins)"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={6}
                      className="bg-background dark:bg-background"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateFeedback}>
                      Save Changes
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Reports; 
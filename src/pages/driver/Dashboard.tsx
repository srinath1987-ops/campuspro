
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import BusDetailsCard from '@/components/driver/BusDetailsCard';
import StudentCountForm from '@/components/driver/StudentCountForm';
import RecentSubmissions from '@/components/driver/RecentSubmissions';
import RouteInformation from '@/components/driver/RouteInformation';
import SuccessDialog from '@/components/driver/SuccessDialog';
import { useBusDetails } from '@/hooks/driver/useBusDetails';
import { useState } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [studentCount, setStudentCount] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (profile?.role !== 'driver') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
  }, [user, profile, navigate, toast]);

  // Use our custom hook to fetch bus details
  const {
    busDetails,
    routeDetails,
    pastCounts,
    submittedToday,
    isLoading,
    refetchData
  } = useBusDetails(profile?.bus_number || null);

  const handleCountSubmitted = () => {
    refetchData();
    setShowSuccessDialog(true);
  };

  return (
    <DashboardLayout title="Driver Dashboard" role="driver" currentPath="/driver/dashboard">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bus Info Card */}
          <BusDetailsCard 
            busDetails={busDetails} 
            routeDetails={routeDetails} 
          />
          
          {/* Student Count Submission */}
          <StudentCountForm 
            busDetails={busDetails}
            submittedToday={submittedToday}
            pastCounts={pastCounts}
            onCountSubmitted={handleCountSubmitted}
          />
          
          {/* Recent Submissions */}
          <RecentSubmissions pastCounts={pastCounts} />
          
          {/* Route Information */}
          <RouteInformation routeDetails={routeDetails} />
        </div>
      )}
      
      {/* Success Dialog */}
      <SuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        studentCount={studentCount}
      />
    </DashboardLayout>
  );
};

export default Dashboard;

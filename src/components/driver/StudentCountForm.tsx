
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Info, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type StudentCountFormProps = {
  busDetails: any | null;
  submittedToday: boolean;
  pastCounts: any[];
  onCountSubmitted: () => void;
};

const StudentCountForm = ({ busDetails, submittedToday, pastCounts, onCountSubmitted }: StudentCountFormProps) => {
  const [studentCount, setStudentCount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCount) {
      toast({
        title: "Input required",
        description: "Please enter the student count",
        variant: "destructive"
      });
      return;
    }
    
    if (!busDetails) {
      toast({
        title: "No bus assigned",
        description: "You don't have a bus assigned to your account.",
        variant: "destructive"
      });
      return;
    }
    
    const count = parseInt(studentCount, 10);
    if (isNaN(count) || count < 0 || count > busDetails.bus_capacity) {
      toast({
        title: "Invalid count",
        description: `Please enter a number between 0 and ${busDetails.bus_capacity}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toISOString();
      
      const { data, error } = await supabase
        .from('bus_student_count')
        .insert([
          {
            bus_number: busDetails.bus_number,
            rfid_id: busDetails.rfid_id,
            student_count: count,
            date: todayDate,
            time: currentTime
          }
        ]);
      
      if (error) throw error;
      
      setShowSuccessDialog(true);
      onCountSubmitted();
      
    } catch (error: any) {
      console.error('Error submitting count:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit student count.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users />
          Student Count Update
        </CardTitle>
        <CardDescription>
          Submit the number of students on your bus for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {busDetails ? (
          submittedToday ? (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Submission Complete</AlertTitle>
              <AlertDescription className="text-green-700">
                You have already submitted the student count for today 
                ({pastCounts.length > 0 ? pastCounts[0].student_count : 0} students).
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="studentCount">Number of Students</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    id="studentCount"
                    type="number"
                    min="0"
                    max={busDetails.bus_capacity}
                    placeholder={`Enter count (max: ${busDetails.bus_capacity})`}
                    value={studentCount}
                    onChange={(e) => setStudentCount(e.target.value)}
                    className="max-w-xs"
                    required
                  />
                  <span className="text-gray-500">/ {busDetails.bus_capacity}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="text"
                  value={new Date().toLocaleDateString()}
                  disabled
                  className="max-w-xs bg-gray-50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="mt-2 bus-gradient-bg hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> Submit Count
                  </span>
                )}
              </Button>
            </form>
          )
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No bus assigned</AlertTitle>
            <AlertDescription>
              You need to have a bus assigned to submit student counts.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentCountForm;

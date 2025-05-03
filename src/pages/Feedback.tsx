import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Check, Info, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { ResizableNavbar } from '@/components/ResizableNavbar';
import { supabase } from '@/integrations/supabase/client';

enum FeedbackType {
  Complaint = 'complaint',
  Suggestion = 'suggestion',
  Appreciation = 'appreciation'
}

interface FeedbackFormData {
  name: string;
  email: string;
  busNumber: string;
  type: FeedbackType;
  message: string;
}

const initialFormData: FeedbackFormData = {
  name: '',
  email: '',
  busNumber: '',
  type: FeedbackType.Suggestion,
  message: ''
};

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FeedbackFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value: FeedbackType) => {
    setFormData((prev) => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit feedback to Supabase
      const { error } = await (supabase as any)
        .from('feedback')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            bus_number: formData.busNumber || null,
            feedback_type: formData.type,
            message: formData.message,
            status: 'pending',
          }
        ]);

      if (error) throw error;

      // Show success message
      setIsSuccess(true);

      // Reset form
      setFormData(initialFormData);

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! Your input helps us improve our service.",
      });
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <ResizableNavbar />
      <main className="flex-grow bg-background">
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Feedback & Suggestions</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We value your input! Share your experiences, suggestions, or concerns about our campus bus service.
            </p>
          </div>

          {isSuccess ? (
            <Card className="mx-auto max-w-md shadow-lg border-green-200 border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold">Feedback Submitted!</h2>
                    <p className="text-muted-foreground mt-2">
                      Thank you for sharing your thoughts. Your feedback helps us improve our service.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    className="mt-4"
                  >
                    Submit Another Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mx-auto shadow-lg">
              <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your feedback about our campus bus service.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="busNumber">Bus Number (Optional)</Label>
                      <Input
                        id="busNumber"
                        name="busNumber"
                        placeholder="If applicable, e.g. BUS001"
                        value={formData.busNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Feedback Type <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleTypeChange(value as FeedbackType)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FeedbackType.Complaint}>Complaint</SelectItem>
                          <SelectItem value={FeedbackType.Suggestion}>Suggestion</SelectItem>
                          <SelectItem value={FeedbackType.Appreciation}>Appreciation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Your Feedback <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please share your feedback, suggestion, or concern in detail..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                    />
                  </div>

                  <Alert variant="default" className="bg-primary/10 border-primary/30">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      All feedback is anonymous by default. We only use your email to follow up if necessary.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="border-t pt-4 px-6 flex flex-wrap gap-3 justify-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
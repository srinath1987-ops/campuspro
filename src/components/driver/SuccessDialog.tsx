
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

type SuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentCount: string;
};

const SuccessDialog = ({ open, onOpenChange, studentCount }: SuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Submission Successful
          </DialogTitle>
          <DialogDescription>
            Your student count has been recorded successfully.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Date:</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Time:</p>
              <p>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="font-medium">Students:</p>
              <p>{studentCount}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;

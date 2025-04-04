
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, Users } from 'lucide-react';

type RecentSubmissionsProps = {
  pastCounts: any[];
};

const RecentSubmissions = ({ pastCounts }: RecentSubmissionsProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock />
          Recent Submissions
        </CardTitle>
        <CardDescription>
          Your last {pastCounts.length} student count submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pastCounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Student Count</th>
                </tr>
              </thead>
              <tbody>
                {pastCounts.map((entry, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4">{formatTime(entry.time)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{entry.student_count} students</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't submitted any student counts yet.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSubmissions;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Construction } from 'lucide-react';

export default function ComingSoon() {
 const navigate = useNavigate();

 return (
 <div className="w-full max-w-lg mx-auto py-12 px-4">
 <Card className="text-center py-16 px-6">
 <Construction className="mx-auto h-16 w-16 text-blue-500 mb-6" />
 <h1 className="text-3xl font-bold font-heading text-text-primary mb-4">Coming Soon</h1>
 <p className="text-lg text-text-secondary max-w-lg mx-auto mb-8">
 We're working hard to bring you this feature. Check back later for updates as we continue to enhance your SmartTrip experience.
 </p>
 <Button onClick={() => navigate('/dashboard')} size="lg">
 Back to Dashboard
 </Button>
 </Card>
 </div>
 );
}

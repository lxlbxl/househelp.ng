'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface SalaryNegotiation {
  id: string;
  match_id: string;
  helper_id: string;
  household_id: string;
  helper_expected_salary: number;
  household_offered_salary?: number;
  final_agreed_salary?: number;
  status: 'pending' | 'negotiating' | 'agreed' | 'rejected';
  negotiation_history: Array<{
    timestamp: string;
    actor: 'helper' | 'household';
    action: 'offer' | 'counter_offer' | 'accept' | 'reject' | 'message';
    amount?: number;
    message?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface SalaryNegotiationProps {
  matchId: string;
  helperId: string;
  householdId: string;
  helperExpectedSalary: number;
  userType: 'helper' | 'household';
  onNegotiationUpdate?: () => void;
}

export default function SalaryNegotiation({
  matchId,
  helperId,
  householdId,
  helperExpectedSalary,
  userType,
  onNegotiationUpdate
}: SalaryNegotiationProps) {
  const [negotiation, setNegotiation] = useState<SalaryNegotiation | null>(null);
  const [offeredAmount, setOfferedAmount] = useState<number>(helperExpectedSalary);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchNegotiation();
  }, [matchId]);

  const fetchNegotiation = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_negotiations')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching negotiation:', error);
        return;
      }

      if (data) {
        setNegotiation(data);
        if (data.household_offered_salary) {
          setOfferedAmount(data.household_offered_salary);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createNegotiation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('salary_negotiations')
        .insert({
          match_id: matchId,
          helper_id: helperId,
          household_id: householdId,
          helper_expected_salary: helperExpectedSalary,
          status: 'pending',
          negotiation_history: [{
            timestamp: new Date().toISOString(),
            actor: 'helper',
            action: 'offer',
            amount: helperExpectedSalary,
            message: 'Initial salary expectation'
          }]
        })
        .select()
        .single();

      if (error) throw error;

      setNegotiation(data);
      toast.success('Salary negotiation started!');
      onNegotiationUpdate?.();
    } catch (error) {
      console.error('Error creating negotiation:', error);
      toast.error('Failed to start negotiation');
    } finally {
      setLoading(false);
    }
  };

  const makeOffer = async () => {
    if (!negotiation || !offeredAmount) return;

    setLoading(true);
    try {
      const newHistoryEntry = {
        timestamp: new Date().toISOString(),
        actor: userType,
        action: 'counter_offer' as const,
        amount: offeredAmount,
        message: message || undefined
      };

      const updatedHistory = [...(negotiation.negotiation_history || []), newHistoryEntry];

      const updateData: any = {
        status: 'negotiating',
        negotiation_history: updatedHistory,
        updated_at: new Date().toISOString()
      };

      if (userType === 'household') {
        updateData.household_offered_salary = offeredAmount;
      }

      const { data, error } = await supabase
        .from('salary_negotiations')
        .update(updateData)
        .eq('id', negotiation.id)
        .select()
        .single();

      if (error) throw error;

      setNegotiation(data);
      setMessage('');
      toast.success('Offer sent!');
      onNegotiationUpdate?.();
    } catch (error) {
      console.error('Error making offer:', error);
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  const acceptOffer = async () => {
    if (!negotiation) return;

    setLoading(true);
    try {
      const finalSalary = userType === 'helper' 
        ? negotiation.household_offered_salary 
        : negotiation.helper_expected_salary;

      const newHistoryEntry = {
        timestamp: new Date().toISOString(),
        actor: userType,
        action: 'accept' as const,
        amount: finalSalary,
        message: message || 'Offer accepted'
      };

      const updatedHistory = [...(negotiation.negotiation_history || []), newHistoryEntry];

      const { data, error } = await supabase
        .from('salary_negotiations')
        .update({
          status: 'agreed',
          final_agreed_salary: finalSalary,
          negotiation_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', negotiation.id)
        .select()
        .single();

      if (error) throw error;

      setNegotiation(data);
      toast.success('Salary agreement reached!');
      onNegotiationUpdate?.();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async () => {
    if (!negotiation) return;

    setLoading(true);
    try {
      const newHistoryEntry = {
        timestamp: new Date().toISOString(),
        actor: userType,
        action: 'reject' as const,
        message: message || 'Offer rejected'
      };

      const updatedHistory = [...(negotiation.negotiation_history || []), newHistoryEntry];

      const { data, error } = await supabase
        .from('salary_negotiations')
        .update({
          status: 'rejected',
          negotiation_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', negotiation.id)
        .select()
        .single();

      if (error) throw error;

      setNegotiation(data);
      toast.success('Offer rejected');
      onNegotiationUpdate?.();
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'negotiating':
        return <Badge variant="default" className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />Negotiating</Badge>;
      case 'agreed':
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Agreed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!negotiation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Expected Monthly Salary: <span className="font-semibold text-foreground">{formatCurrency(helperExpectedSalary)}</span>
            </p>
            {userType === 'household' && (
              <Button onClick={createNegotiation} disabled={loading}>
                Start Salary Discussion
              </Button>
            )}
            {userType === 'helper' && (
              <p className="text-sm text-muted-foreground">
                Waiting for household to start salary discussion...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Negotiation
          </span>
          {getStatusBadge(negotiation.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Helper's Expected</p>
            <p className="font-semibold">{formatCurrency(negotiation.helper_expected_salary)}</p>
          </div>
          {negotiation.household_offered_salary && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Household's Offer</p>
              <p className="font-semibold">{formatCurrency(negotiation.household_offered_salary)}</p>
            </div>
          )}
          {negotiation.final_agreed_salary && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Agreed Salary</p>
              <p className="font-semibold text-green-600">{formatCurrency(negotiation.final_agreed_salary)}</p>
            </div>
          )}
        </div>

        {/* Negotiation History */}
        {negotiation.negotiation_history && negotiation.negotiation_history.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Negotiation History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {negotiation.negotiation_history.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg text-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{entry.actor}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{entry.action.replace('_', ' ')}</span>
                      {entry.amount && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium">{formatCurrency(entry.amount)}</span>
                        </>
                      )}
                    </div>
                    {entry.message && (
                      <p className="text-muted-foreground">{entry.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {negotiation.status === 'pending' || negotiation.status === 'negotiating' ? (
          <div className="space-y-4">
            {/* Make Offer Section */}
            {((userType === 'household' && negotiation.status === 'pending') || 
              (negotiation.status === 'negotiating')) && (
              <div className="space-y-3">
                <Label>
                  {userType === 'household' ? 'Your Offer' : 'Counter Offer'} (₦)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={offeredAmount}
                  onChange={(e) => setOfferedAmount(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                />
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  rows={2}
                />
                <Button onClick={makeOffer} disabled={loading || !offeredAmount}>
                  {userType === 'household' ? 'Make Offer' : 'Counter Offer'}
                </Button>
              </div>
            )}

            {/* Accept/Reject Buttons */}
            {negotiation.status === 'negotiating' && (
              <div className="flex gap-2">
                <Button onClick={acceptOffer} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  Accept Current Offer
                </Button>
                <Button onClick={rejectOffer} disabled={loading} variant="destructive">
                  Reject & End Discussion
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            {negotiation.status === 'agreed' && (
              <p className="text-green-600 font-medium">
                🎉 Salary agreement reached at {formatCurrency(negotiation.final_agreed_salary!)}
              </p>
            )}
            {negotiation.status === 'rejected' && (
              <p className="text-red-600 font-medium">
                ❌ Salary negotiation ended without agreement
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
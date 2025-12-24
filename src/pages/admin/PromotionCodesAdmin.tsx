import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Copy, Trash2, Gift, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface PromotionCode {
  id: string;
  code: string;
  duration_days: number;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  expires_at: string | null;
}

const DURATION_OPTIONS = [
  { value: '7', label: '1 Week (7 days)' },
  { value: '30', label: '1 Month (30 days)' },
  { value: '180', label: '6 Months (180 days)' },
];

// Generate a random promotion code
const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'IELTS-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function PromotionCodesAdmin() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<PromotionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [codeCount, setCodeCount] = useState('1');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promotion_codes' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(((data as unknown) as PromotionCode[]) || []);
    } catch (error) {
      console.error('Error loading codes:', error);
      toast.error('Failed to load promotion codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const count = parseInt(codeCount);
      const duration = parseInt(selectedDuration);
      const newCodes = [];

      for (let i = 0; i < count; i++) {
        newCodes.push({
          code: generateCode(),
          duration_days: duration,
          created_by: user.id,
        });
      }

      const { data, error } = await supabase
        .from('promotion_codes' as any)
        .insert(newCodes as any)
        .select();

      if (error) throw error;

      const inserted = ((data as unknown) as PromotionCode[]) || [];
      setCodes([...inserted, ...codes]);
      toast.success(`Generated ${count} promotion code(s)`);
    } catch (error: any) {
      console.error('Error generating codes:', error);
      toast.error(`Failed to generate codes: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;

    try {
      const { error } = await supabase
        .from('promotion_codes' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCodes(codes.filter(c => c.id !== id));
      toast.success('Code deleted');
    } catch (error: any) {
      console.error('Error deleting code:', error);
      toast.error(`Failed to delete code: ${error.message}`);
    }
  };

  const getDurationLabel = (days: number) => {
    if (days === 7) return '1 Week';
    if (days === 30) return '1 Month';
    if (days === 180) return '6 Months';
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotion Codes</h1>
          <p className="text-muted-foreground">Generate and manage promotional access codes</p>
        </div>
      </div>

      {/* Generate Codes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Generate New Codes
          </CardTitle>
          <CardDescription>
            Create promotion codes that grant users premium access for a specified duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="duration">Access Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger id="duration" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Codes</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={codeCount}
                onChange={(e) => setCodeCount(e.target.value)}
                className="w-24"
              />
            </div>
            <Button onClick={handleGenerateCodes} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Promotion Codes ({codes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No promotion codes generated yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Claimed</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>{getDurationLabel(code.duration_days)}</TableCell>
                    <TableCell>
                      {code.claimed_by ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Claimed
                        </Badge>
                      ) : (
                        <Badge variant="outline">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(code.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {code.claimed_at 
                        ? format(new Date(code.claimed_at), 'MMM d, yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyCode(code.code)}
                          disabled={!!code.claimed_by}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCode(code.id)}
                          disabled={!!code.claimed_by}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

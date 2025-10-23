'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Loader2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleSendOTP = async () => {
    setSendingOtp(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'OTP sent to your email');
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Invalid OTP');
        setOtp('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  if (verified) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">
              Your email has been successfully verified.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size={60} />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP 
              maxLength={6} 
              value={otp} 
              onChange={setOtp}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify Email
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the OTP?
            </p>
            <Button 
              variant="outline" 
              onClick={handleSendOTP}
              disabled={sendingOtp}
              className="w-full"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Resend OTP
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              OTP is valid for 10 minutes
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              Already verified?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

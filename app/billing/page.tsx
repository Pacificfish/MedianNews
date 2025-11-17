"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getStripe } from "@/lib/stripe";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadSubscription(user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function loadSubscription(userId: string) {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    setSubscription(data);
    setLoading(false);
  }

  async function handleCheckout() {
    const response = await fetch("/api/checkout", {
      method: "POST",
    });

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId });
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  const isPro = subscription?.active && subscription?.plan === "pro";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Billing</h1>
        <p className="text-gray-600">Choose the plan that's right for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>10 analyses per day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Access to trending feed</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Compare mode</span>
              </li>
            </ul>
            {isPro ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full">
                Current Plan
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-left">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <div className="text-3xl font-bold">
              ${process.env.NEXT_PUBLIC_STRIPE_PRICE_AMOUNT || "5"}
              <span className="text-lg font-normal">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Unlimited analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Personal bias analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Priority queue</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>All free features</span>
              </li>
            </ul>
            {isPro ? (
              <Button disabled className="w-full bg-left">
                Active
              </Button>
            ) : (
              <Button onClick={handleCheckout} className="w-full bg-left text-white hover:bg-left/90">
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {isPro && subscription?.current_period_end && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">
              Your Pro subscription renews on{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




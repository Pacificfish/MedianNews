import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BiasTracker } from "@/components/bias-tracker";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-heading font-bold mb-4 text-gray-900 dark:text-gray-100">
            Your Bias Profile
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            See your reading patterns and get recommendations for balanced coverage
          </p>
        </div>

        <BiasTracker userId={user.id} />
      </div>
    </div>
  );
}




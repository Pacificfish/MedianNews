"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ArticleClickTrackerProps {
  articleId: string;
}

export function ArticleClickTracker({ articleId }: ArticleClickTrackerProps) {
  useEffect(() => {
    const trackClick = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Track reading history
        await supabase
          .from("reading_history")
          .upsert({
            user_id: user.id,
            article_id: articleId,
            read_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,article_id"
          });
      }
    };

    trackClick();
  }, [articleId]);

  return null;
}


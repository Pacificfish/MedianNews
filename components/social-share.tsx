"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Mail, Link2, Bookmark, EyeOff, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SocialShareProps {
  url: string;
  title: string;
  topicId: string;
}

export function SocialShare({ url, title, topicId }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hidden, setHidden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkSavedStatus();
    checkHiddenStatus();
  }, [topicId]);

  const checkSavedStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_topics")
      .select("id")
      .eq("topic_id", topicId)
      .eq("user_id", user.id)
      .single();

    setSaved(!!data);
  };

  const checkHiddenStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("hidden_topics")
      .select("id")
      .eq("topic_id", topicId)
      .eq("user_id", user.id)
      .single();

    setHidden(!!data);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleShare = (platform: string) => {
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (saved) {
      await supabase
        .from("saved_topics")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_id", user.id);
      setSaved(false);
    } else {
      await supabase
        .from("saved_topics")
        .insert({
          topic_id: topicId,
          user_id: user.id,
        });
      setSaved(true);
    }
    router.refresh();
  };

  const handleHide = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (hidden) {
      await supabase
        .from("hidden_topics")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_id", user.id);
      setHidden(false);
    } else {
      await supabase
        .from("hidden_topics")
        .insert({
          topic_id: topicId,
          user_id: user.id,
        });
      setHidden(true);
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => handleShare("facebook")}
      >
        <Facebook className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => handleShare("twitter")}
      >
        <Twitter className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => handleShare("linkedin")}
      >
        <Linkedin className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => handleShare("email")}
      >
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={handleCopyLink}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 ${saved ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700" : ""}`}
        onClick={handleSave}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${saved ? "fill-current" : ""}`} />
        {saved ? "Saved" : "Save"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={handleHide}
      >
        <EyeOff className="h-4 w-4 mr-2" />
        {hidden ? "Unhide" : "Hide"}
      </Button>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user_id: string;
}

interface CommentsSectionProps {
  topicId: string;
}

export function CommentsSection({ topicId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    loadComments();

    const channel = supabase
      .channel(`topic:${topicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `topic_id=eq.${topicId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      topic_id: topicId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (!error) {
      setNewComment("");
      loadComments();
    }
    setLoading(false);
  }

  async function handleUpvote(commentId: string) {
    if (!user) return;

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    const { error } = await supabase
      .from("comments")
      .update({ upvotes: comment.upvotes + 1 })
      .eq("id", commentId);

    if (!error) {
      loadComments();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newComment.trim()}>
                Post
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            <a href="/login" className="text-left underline">
              Sign in
            </a>{" "}
            to comment
          </p>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4">
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  <button
                    onClick={() => handleUpvote(comment.id)}
                    className="flex items-center gap-1 hover:text-text"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {comment.upvotes}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}




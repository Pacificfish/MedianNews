"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Source } from "@/types";

interface SourcesTableProps {
  sources: Source[];
}

export function SourcesTable({ sources: initialSources }: SourcesTableProps) {
  const [sources, setSources] = useState(initialSources);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    home_url: "",
    rss_url: "",
    bias_label: "Center" as Source["bias_label"],
    authority_score: 0.5,
    country: "US",
    language: "en",
    active: true,
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("sources")
      .insert(formData)
      .select()
      .single();

    if (!error && data) {
      setSources([data, ...sources]);
      setShowForm(false);
      setFormData({
        name: "",
        home_url: "",
        rss_url: "",
        bias_label: "Center",
        authority_score: 0.5,
        country: "US",
        language: "en",
        active: true,
      });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { data } = await supabase
      .from("sources")
      .update({ active: !active })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setSources(sources.map((s) => (s.id === id ? data : s)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Sources ({sources.length})</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Source"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bias Label</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={formData.bias_label}
                    onChange={(e) => setFormData({ ...formData, bias_label: e.target.value as any })}
                  >
                    <option value="Left">Left</option>
                    <option value="Center-Left">Center-Left</option>
                    <option value="Center">Center</option>
                    <option value="Center-Right">Center-Right</option>
                    <option value="Right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Home URL</label>
                  <Input
                    type="url"
                    value={formData.home_url}
                    onChange={(e) => setFormData({ ...formData, home_url: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">RSS URL</label>
                  <Input
                    type="url"
                    value={formData.rss_url}
                    onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit">Add Source</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bias</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RSS URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{source.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{source.bias_label}</td>
                    <td className="px-6 py-4">
                      <a href={source.rss_url} target="_blank" rel="noopener noreferrer" className="text-left text-sm truncate max-w-xs block">
                        {source.rss_url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${source.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {source.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(source.id, source.active)}
                      >
                        {source.active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




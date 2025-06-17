"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGuide } from "@/lib/actions/guide.action";
import { toast } from "@/hooks/use-toast";

export default function TestGuideCreation() {
  const [title, setTitle] = useState("Test Guide Title");
  const [content, setContent] = useState(
    "This is a test guide content with detailed information about the topic."
  );
  const [tags, setTags] = useState("travel,guide,test");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      console.log("Creating guide with:", {
        title,
        content,
        tags: tagsArray,
        images: files ? Array.from(files) : [],
      });

      const result = await createGuide({
        title,
        content,
        tags: tagsArray,
        images1: files ? Array.from(files) : [],
      });

      if (result.success) {
        toast({
          title: "Success!",
          description: "Guide created successfully",
        });
        console.log("Guide created:", result.data);

        // Reset form
        setTitle("");
        setContent("");
        setTags("");
        setFiles(null);
        // Reset file input
        const fileInput = document.getElementById("images") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create guide",
          variant: "destructive",
        });
        console.error("Error:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Test Guide Creation</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter guide title"
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter guide content"
            className="w-full p-2 border rounded-md min-h-[100px]"
            required
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            required
          />
        </div>

        <div>
          <Label htmlFor="images">Images (optional)</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(e.target.files)}
          />
          {files && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {files.length} file(s)
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating Guide..." : "Create Guide"}
        </Button>
      </form>
    </div>
  );
}

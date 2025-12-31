'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Send, Star } from 'lucide-react';

interface ImageTool {
  id: string;
  name: string;
}

export default function SubmitPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [promptText, setPromptText] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [toolUsed, setToolUsed] = useState('');
  const [tools, setTools] = useState<ImageTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch('/api/tools/image');
        const data = await res.json();
        setTools(data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          promptText,
          rating,
          imageUrl: imageUrl || null,
          toolUsed: toolUsed || null,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/showcase');
        }, 2000);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen pb-12">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-center">
            Submit to <span className="gradient-text">Community Showcase</span>
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Share your best prompts with the community
          </p>

          {success ? (
            <Card className="glass p-8 text-center">
              <div className="gradient-primary p-4 rounded-full w-fit mx-auto mb-4">
                <Send className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Submission Received!</h2>
              <p className="text-muted-foreground">
                Your prompt has been submitted for review. Redirecting to showcase...
              </p>
            </Card>
          ) : (
            <Card className="glass p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="promptText">Prompt Text *</Label>
                  <Textarea
                    id="promptText"
                    placeholder="Enter your prompt here..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    required
                    className="glass border-white/20 mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            r <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({rating} star{rating !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="toolUsed">Tool Used</Label>
                  <Select value={toolUsed} onValueChange={setToolUsed}>
                    <SelectTrigger className="glass border-white/20 mt-2">
                      <SelectValue placeholder="Select a tool (optional)" />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10">
                      {tools?.map((tool) => (
                        <SelectItem key={tool.id} value={tool.name}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="glass border-white/20 mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary gap-2"
                  disabled={loading}
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Submitting...' : 'Submit to Showcase'}
                </Button>
              </form>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

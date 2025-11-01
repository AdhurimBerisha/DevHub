import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageSquare, Heart, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function CommunityGuide() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/tags">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tags
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Community Guide</h1>
          <p className="text-muted-foreground">
            Welcome to DevHub! This guide will help you get the most out of our
            developer community.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Getting Started */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Getting Started</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Create Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your profile with a username, avatar, and bio to help
                  other developers get to know you.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Explore Topics</h3>
                <p className="text-sm text-muted-foreground">
                  Browse tags and communities to find discussions that interest
                  you. Follow tags to get personalized content in your feed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Join Communities</h3>
                <p className="text-sm text-muted-foreground">
                  Find or create communities around specific technologies, projects,
                  or interests. Communities help you connect with like-minded
                  developers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Posting Guidelines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Posting Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Quality Content</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Write clear, descriptive titles that summarize your post</li>
                  <li>Provide context and background information</li>
                  <li>Use code blocks for code snippets and examples</li>
                  <li>Include relevant tags to help others discover your content</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What to Post</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="secondary">Tutorials</Badge>
                  <Badge variant="secondary">Questions</Badge>
                  <Badge variant="secondary">Project Showcases</Badge>
                  <Badge variant="secondary">Tech Discussions</Badge>
                  <Badge variant="secondary">Learning Resources</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share tutorials, ask questions, showcase projects, discuss
                  technologies, or share helpful resources.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What to Avoid</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Low-effort posts without context</li>
                  <li>Duplicate content that's already been posted</li>
                  <li>Spam or self-promotion without value</li>
                  <li>Content that's not relevant to development</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Community Values */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Community Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Be Respectful</h3>
                <p className="text-sm text-muted-foreground">
                  Treat everyone with respect and kindness. Everyone is here to
                  learn and share knowledge, regardless of their experience level.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Be Constructive</h3>
                <p className="text-sm text-muted-foreground">
                  Offer helpful feedback and suggestions. When asking questions,
                  provide context. When answering, be patient and thorough.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Share Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Help others learn by sharing your experiences, solutions, and
                  insights. The best communities are built on mutual support.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety & Moderation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Safety & Moderation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Reporting Issues</h3>
                <p className="text-sm text-muted-foreground">
                  If you encounter spam, harassment, or inappropriate content,
                  please report it. Our community moderators review reports
                  promptly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Protect your privacy and the privacy of others. Don't share
                  personal information, API keys, or sensitive credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Content Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Respect copyright and intellectual property. Give credit when
                  sharing others' work, and don't plagiarize content.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags & Communities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Tags & Communities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Using Tags</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Tags help organize content and make it easier to discover. When
                  posting:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Use relevant, existing tags when possible</li>
                  <li>Create new tags only if they don't already exist</li>
                  <li>Use 3-5 tags per post for best discoverability</li>
                  <li>Keep tag names clear and descriptive</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Communities</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Communities are focused spaces for specific topics or groups:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Join communities related to your interests</li>
                  <li>Post in communities when your content is relevant</li>
                  <li>Respect community rules and guidelines</li>
                  <li>Create communities for topics that don't exist yet</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">For Questions</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Search before asking</li>
                    <li>Provide code examples</li>
                    <li>Explain what you've tried</li>
                    <li>Include error messages</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">For Answers</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Be clear and concise</li>
                    <li>Provide code examples</li>
                    <li>Explain the "why" not just "what"</li>
                    <li>Link to documentation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer CTA */}
          <Card className="border-primary">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                Ready to contribute?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join the conversation and help build our developer community!
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link to="/create-post">Create Your First Post</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/communities">Explore Communities</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


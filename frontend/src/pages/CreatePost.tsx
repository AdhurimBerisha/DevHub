import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import type { Tag } from "@/types/Types";
import type { CreatePostInput, PostResponse } from "@/types/graphql";
import {
  CREATE_POST_MUTATION,
  GET_POST_QUERY,
  UPDATE_POST_MUTATION,
} from "@/graphql/posts";
import { GET_TAGS_QUERY } from "@/graphql/posts";
import { GET_COMMUNITIES_QUERY } from "@/graphql/communities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { CREATE_TAG_MUTATION } from "@/graphql/posts";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  tagIds: z.array(z.string()).optional(),
  communityId: z.string().optional(),
  published: z.boolean().default(false),
});

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");
  const communityIdParam = searchParams.get("communityId");

  const { data: tagsData } = useQuery(GET_TAGS_QUERY);
  const { data: communitiesData } = useQuery(GET_COMMUNITIES_QUERY, {
    variables: { limit: 200, offset: 0 },
  });
  const [createPost] = useMutation<
    { createPost: PostResponse },
    { input: CreatePostInput }
  >(CREATE_POST_MUTATION, {
    onCompleted: (data) => {
      if (data.createPost.success) {
        toast({
          title: "Success",
          description: "Post created successfully",
        });
        navigate(`/post/${data.createPost.post.id}`);
      } else {
        toast({
          title: "Error",
          description: data.createPost.message,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const [updatePost] = useMutation(UPDATE_POST_MUTATION, {
    onCompleted: (data) => {
      if (data.updatePost.success) {
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
        navigate(`/post/${data.updatePost.post.id}`);
      } else {
        toast({
          title: "Error",
          description: data.updatePost.message,
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tagIds: [],
      communityId: communityIdParam ?? undefined,
      published: false,
    },
  });

  const [tagInput, setTagInput] = useState("");
  const [createTagMutation] = useMutation(CREATE_TAG_MUTATION);

  type LocalCreatePostInput = CreatePostInput & {
    communityId?: string | undefined;
  };

  const { data: postData, loading: postLoading } = useQuery(GET_POST_QUERY, {
    variables: { id: editId },
    skip: !editId,
  });

  useEffect(() => {
    if (postData?.post) {
      const p = postData.post;
      form.reset({
        title: p.title || "",
        content: p.content || "",
        tagIds: (p.tags || []).map((t: { id: string }) => t.id),
      });
      setTagInput(
        (p.tags || []).map((t: { name: string }) => t.name).join(", ")
      );
      form.setValue(
        "communityId",
        p.communityId ? String(p.communityId) : undefined
      );
      form.setValue("published", !!p.published);
    }
  }, [postData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const names = tagInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const tagIds: string[] = [];
      const existingTags = (tagsData?.tags ?? []) as {
        id: string;
        name: string;
      }[];

      for (const name of names) {
        const found = existingTags.find(
          (t) => t.name.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          tagIds.push(found.id);
        } else {
          try {
            const res = await createTagMutation({
              variables: { input: { name, color: null } },
            });
            const newTagId = res?.data?.createTag?.tag?.id;
            if (newTagId) tagIds.push(newTagId);
          } catch (e) {
            console.error("Failed to create tag:", name, e);
          }
        }
      }

      const inputPayload = {
        title: values.title,
        content: values.content,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        published: values.published,
        communityId: values.communityId,
      } as LocalCreatePostInput;

      if (editId) {
        await updatePost({ variables: { id: editId, input: inputPayload } });
      } else {
        await createPost({ variables: { input: inputPayload } });
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const tagOptions =
    tagsData?.tags.map((tag: Tag) => ({
      value: tag.id,
      label: tag.name,
    })) || [];
  if (editId && postLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 w-1/3 bg-muted/20 rounded" />
                <div className="h-4 w-1/2 bg-muted/20 rounded" />
                <div className="h-40 w-full bg-muted/20 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Edit Post" : "Create a New Post"}</CardTitle>
            <CardDescription>
              Share your thoughts, ideas, or knowledge with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            placeholder="Enter tags, comma separated (e.g. react, typescript)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tagInput
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .map((name) => (
                                <span
                                  key={name}
                                  className="inline-flex items-center rounded bg-muted px-2 py-1 text-sm"
                                >
                                  {name}
                                </span>
                              ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Type tags separated by commas. New tags will be created
                        automatically.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="communityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community (optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? "__none"}
                          onValueChange={(val) =>
                            field.onChange(val === "__none" ? undefined : val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No community" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">No community</SelectItem>
                            {communitiesData?.communities?.map(
                              (c: { id: string; name: string }) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {c.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Optionally assign this post to a community.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publish immediately
                        </FormLabel>
                        <FormDescription>
                          If disabled, your post will be saved as a draft
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? editId
                        ? "Updating..."
                        : "Creating..."
                      : editId
                      ? "Update Post"
                      : "Create Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

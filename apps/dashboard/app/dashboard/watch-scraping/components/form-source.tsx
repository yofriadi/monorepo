"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import ActionButton from "@workspace/ui/components/prismui/action-button";
import { useToast } from "@workspace/ui/hooks/use-toast"
import { useMutation } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/providers/get-query-client'
import { createSourceMutationConfig } from "../queries/source";

const formSchema = z.object({
  url: z.string().url(),
});

export function FormSource({ productId }: { productId: string }) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const queryClient = getQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
    mode: "onChange",
  });

  const createSource = useMutation({
    ...createSourceMutationConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['source'] });
      toast({
        title: "Success",
        description: "Source created successfully and scraping started",
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createSource.mutate({ productId, url: values.url });
    setDialogOpen(false);
  }

  const { pending } = useFormStatus();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="Url to scrape and crawl" {...field} />
              </FormControl>
              <FormDescription>
                This URL will be the starting point for the scraping process.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 mt-4">
          <Button
            className="flex-1"
            type="button"
            onClick={async () => {
              const isValid = await form.trigger();
              if (isValid) {
                setDialogOpen(true);
              }
            }}
          >
            Create Scraping
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="space-y-6">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will create and will be the
                  starting point for the scraping process.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <ActionButton
                  type="button"
                  onClick={() => form.handleSubmit(onSubmit)()}
                  isPending={pending}
                >
                  Create Scraping
                </ActionButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  );
}


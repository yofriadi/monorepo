"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InputDropdown } from "./input-dropdown";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import ActionButton from "@workspace/ui/components/prismui/action-button";
import { useToast } from "@workspace/ui/hooks/use-toast";
import { getQueryClient } from '@/lib/providers/get-query-client'
import { useQuery, useMutation } from '@tanstack/react-query';
import { Model, QUERY_KEY_GET_MODELS, modelOptions, createModel } from "../queries/model";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
  altName: z.string().optional(),
});

export function FormModel({ brandId, modelId, setModelId, onReset }: {
  brandId: string;
  modelId: string;
  setModelId: (modelId: string) => void;
  onReset: () => void;
}) {
  const { toast } = useToast();
  const queryClient = getQueryClient();

  const [showModelAltNameInput, setShowModelAltNameInput] = useState(false);
  const [isModelNameInputDisabled, setModelNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { data: models = [], isLoading } = useQuery({
    ...modelOptions(brandId),
    enabled: isDropdownOpen,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", altName: "" },
  });

  const mutation = useMutation({
    ...createModel,
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_MODELS, brandId] });
      toast({
        title: "Success",
        description: "Model created successfully",
      });
      if (newModel?.id) {
        setModelId(newModel.id);
        setModelNameInputDisabled(true);
      }
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create model",
        variant: "destructive",
      });
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const isFormEmpty = Object.values(formValues).every((value) => value === "");
    setIsResetDisabled(isFormEmpty);
  }, [formValues]);

  const handleInputChange = (value: string) => {
    form.setValue("name", value);
    setShowModelAltNameInput(!!value);
    setModelNameInputDisabled(false);
  };

  const handleSelectOption = (model: Model) => {
    form.setValue("name", model.name);
    setModelId(model.id);
    setShowModelAltNameInput(false);
    setModelNameInputDisabled(true);
    setIsDropdownOpen(false);
  };

  const resetForm = () => {
    form.reset();
    setModelId("");
    setShowModelAltNameInput(false);
    setModelNameInputDisabled(false);
    setIsResetDisabled(true);
    onReset();
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      brandId,
      name: values.name,
      altName: values.altName,
    });
  }

  const { pending } = useFormStatus();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Model</FormLabel>
              <FormControl>
                <InputDropdown<Model>
                  isOpen={isDropdownOpen}
                  onToggle={setIsDropdownOpen}
                  options={models}
                  onSelectOption={handleSelectOption}
                  onInputChange={handleInputChange}
                  placeholder="Type to create Model Name"
                  value={field.value}
                  isDisabled={isModelNameInputDisabled}
                  isLoading={isLoading}
                />
              </FormControl>
              {(!modelId && !showModelAltNameInput) && (
                <FormDescription>
                  Select from the dropdown after creating a new entry, or choose an existing one.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {showModelAltNameInput && (
          <FormField
            control={form.control}
            name="altName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Alternative name" {...field} />
                </FormControl>
                <FormDescription>
                  This input is optional, use comma separated values.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!modelId && (
          <div className="flex gap-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
              disabled={isResetDisabled || pending}
            >
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={pending}
              onClick={async () => {
                const isValid = await form.trigger();
                if (isValid) {
                  setDialogOpen(true);
                }
              }}
            >
              Create Model
            </Button>
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Model?</DialogTitle>
              <DialogDescription>
                This will create a new model and proceed to the next step.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <ActionButton
                type="button"
                onClick={() => form.handleSubmit(onSubmit)()}
                isPending={mutation.isPending || pending}
              >
                Confirm and Create
              </ActionButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
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
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Model, modelOptions, createModelMutationConfig } from "../queries/model";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
  altName: z.string().optional(),
});

interface FormModelProps {
  brandId: string;
  modelId: string;
  setModelId: (modelId: string) => void;
}

export function FormModel({ brandId, modelId, setModelId }: FormModelProps) {
  const { data: models = [] } = useSuspenseQuery(modelOptions(brandId));
  const [showModelAltNameInput, setShowModelAltNameInput] = useState(false);
  const [isModelNameInputDisabled, setModelNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState<Model[]>(models);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = getQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      altName: "",
    },
  });

  useEffect(() => {
    setFilteredOptions(models);
  }, [models]);

  const createModel = useMutation({
    ...createModelMutationConfig,
    onSuccess: (model) => {
      queryClient.invalidateQueries({ queryKey: ['models', brandId] });
      toast({
        title: "Success",
        description: "Model created successfully",
      });
      if (model?.id) {
        setModelId(model.id);
        setModelNameInputDisabled(true);
      }
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create model",
        variant: "destructive",
      });
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const isFormEmpty = Object.values(formValues).every((value) => value === "");
    setIsResetDisabled(isFormEmpty);
  }, [formValues]);

  const handleToggleDropdown = async (newIsOpen: boolean) => {
    if (newIsOpen && !models.length) {
      await queryClient.fetchQuery(modelOptions(brandId));
    }
    setIsDropdownOpen(newIsOpen);
  };

  const handleInputChange = (value: string) => {
    form.setValue("name", value);
    setFilteredOptions(
      models.filter((option) =>
        option.name.toLowerCase().includes(value.toLowerCase())
      )
    );
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

  function resetForm() {
    form.reset();
    setModelId("");
    setShowModelAltNameInput(false);
    setModelNameInputDisabled(false);
    setIsResetDisabled(true);
    setFilteredOptions(models);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createModel.mutate({
      brandId,
      name: values.name,
      altName: values.altName,
    });
  }

  const { pending } = useFormStatus();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-1">
              <FormLabel>Model</FormLabel>
              <FormControl>
                <InputDropdown<Model>
                  isOpen={isDropdownOpen}
                  onToggle={handleToggleDropdown}
                  options={models}
                  filteredOptions={filteredOptions}
                  onSelectOption={handleSelectOption}
                  onInputChange={handleInputChange}
                  placeholder="Type to create Model Name"
                  value={field.value}
                  isDisabled={isModelNameInputDisabled}
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
              <FormItem>
                <FormControl>
                  <Input placeholder="Alternative name" {...field} className="mt-1" />
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
          <div className="flex gap-4 mt-4">
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
          <DialogContent className="space-y-6">
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
                type="submit"
                onClick={() => form.handleSubmit(onSubmit)()}
                isPending={pending}
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

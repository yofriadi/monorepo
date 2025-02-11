"use client";

import { useState, useEffect } from "react";
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
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
import { getQueryClient } from '@/lib/providers/get-query-client'
import ActionButton from "@workspace/ui/components/prismui/action-button";
import { brandOptions, createBrandMutationConfig, type Brand } from "../queries/brand";
import { useToast } from "@workspace/ui/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
  altName: z.string().optional(),
});

interface FormBrandProps {
  brandId: string;
  setBrandId: (brandId: string) => void;
}

export function FormBrand({ brandId, setBrandId }: FormBrandProps) {
  const { data: brands = [] } = useSuspenseQuery(brandOptions);
  const [showBrandAltNameInput, setShowBrandAltNameInput] = useState(false);
  const [isBrandNameInputDisabled, setBrandNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState<Brand[]>(brands);
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

  const createBrand = useMutation({
    ...createBrandMutationConfig,
    onSuccess: (newBrand) => {
      // Update the brands query cache
      queryClient.setQueryData<Brand[]>(['brands'], (oldData = []) => {
        return [...oldData, newBrand];
      });

      // Update UI state
      setBrandId(newBrand.id);
      setBrandNameInputDisabled(true);
      setDialogOpen(false);

      // Show success toast
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create brand",
        variant: "destructive",
      });
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const isFormEmpty = Object.values(formValues).every((value) => value === "");
    setIsResetDisabled(isFormEmpty);
  }, [formValues]);

  useEffect(() => {
    setFilteredOptions(brands);
  }, [brands]);

  const handleToggleDropdown = (newIsOpen: boolean) => {
    setIsDropdownOpen(newIsOpen);
  };

  const handleInputChange = (value: string) => {
    form.setValue("name", value);
    setFilteredOptions(
      brands.filter((option) =>
        option.name.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowBrandAltNameInput(!!value);
    setBrandNameInputDisabled(false);
  };

  const handleSelectOption = (brand: Brand) => {
    form.setValue("name", brand.name);
    setBrandId(brand.id);
    setShowBrandAltNameInput(false);
    setBrandNameInputDisabled(true);
    setIsDropdownOpen(false);
  };

  function resetForm() {
    form.reset();
    setBrandId("");
    setShowBrandAltNameInput(false);
    setBrandNameInputDisabled(false);
    setIsResetDisabled(true);
    setFilteredOptions(brands);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createBrand.mutate({
      name: values.name,
      altName: values.altName,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-1">
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <InputDropdown<Brand>
                  isOpen={isDropdownOpen}
                  onToggle={handleToggleDropdown}
                  options={brands}
                  filteredOptions={filteredOptions}
                  error=""
                  onSelectOption={handleSelectOption}
                  onInputChange={handleInputChange}
                  placeholder="Type to create new Brand Name"
                  value={field.value}
                  isDisabled={isBrandNameInputDisabled}
                />
              </FormControl>
              {(!brandId && !showBrandAltNameInput) && (
                <FormDescription>
                  Select from the dropdown after creating a new entry, or choose an existing one.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        {showBrandAltNameInput && (
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
        {!brandId && (
          <div className="flex gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="flex-1"
              disabled={isResetDisabled}
            >
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={async () => {
                const isValid = await form.trigger();
                if (isValid) {
                  setDialogOpen(true);
                }
              }}
            >
              Create Brand
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create New Brand?</DialogTitle>
              <DialogDescription>
                This will create a new brand and proceed to the next step.
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
                isPending={createBrand.isPending || useFormStatus().pending}
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

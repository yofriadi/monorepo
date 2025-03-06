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
import { useToast } from "@workspace/ui/hooks/use-toast";
import { type Brand, QUERY_KEY_GET_BRANDS, brandOptions, createBrand } from "../queries/brand"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
  altName: z.string().optional(),
});

export function FormBrand({
  brandId,
  setBrandId,
  onReset,
}: {
  brandId: string;
  setBrandId: (brandId: string) => void;
  onReset: () => void;
}) {
  const { toast } = useToast();
  const queryClient = getQueryClient();
  const { data: brands } = useSuspenseQuery(brandOptions)

  const [showBrandAltNameInput, setShowBrandAltNameInput] = useState(false);
  const [isBrandNameInputDisabled, setBrandNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      altName: "",
    },
  });

  const mutation = useMutation({
    ...createBrand,
    onSuccess: (newBrand) => {
      queryClient.setQueryData<Brand[]>([QUERY_KEY_GET_BRANDS], (oldData = []) => {
        return [...oldData, newBrand];
      });
      setBrandId(newBrand.id);
      setBrandNameInputDisabled(true);
      setDialogOpen(false);
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

  const handleInputChange = (value: string) => {
    form.setValue("name", value);
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

  const resetForm = () => {
    form.reset();
    setBrandId("");
    setShowBrandAltNameInput(false);
    setBrandNameInputDisabled(false);
    setIsResetDisabled(true);
    onReset();
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({
      name: values.name,
      altName: values.altName,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <InputDropdown<Brand>
                  isOpen={isDropdownOpen}
                  onToggle={setIsDropdownOpen}
                  options={brands}
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
        {!brandId && (
          <div className="flex gap-4 w-full">
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
          <DialogContent className="max-w-md">
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
                isPending={mutation.isPending || useFormStatus().pending}
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
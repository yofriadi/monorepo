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
import { useToast } from "@workspace/ui/hooks/use-toast"
import { useQuery, useMutation } from '@tanstack/react-query'
import { Product, productOptions, createProduct } from "../queries/product";

const formSchema = z.object({
  referenceNumber: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
});

export function FormProduct({ modelId, productId, setProductId, onReset }: {
  modelId: string;
  productId: string;
  setProductId: (modelId: string) => void;
  onReset: () => void;
}) {
  const { toast } = useToast();

  const [isProductNameInputDisabled, setProductNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    ...productOptions(modelId),
    enabled: isDropdownOpen,
  });

  const mutation = useMutation({
    ...createProduct,
    onSuccess: (product) => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });

      if (product?.id) {
        setProductId(product.id);
        setProductNameInputDisabled(true);
      }

      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { referenceNumber: "" },
  });

  const formValues = form.watch();

  useEffect(() => {
    const isFormEmpty = Object.values(formValues).every((value) => value === "");
    setIsResetDisabled(isFormEmpty);
  }, [formValues]);

  const handleInputChange = (value: string) => {
    form.setValue("referenceNumber", value);
    setProductNameInputDisabled(false);
  };

  const handleSelectOption = (product: Product) => {
    form.setValue("referenceNumber", product.referenceNumber);
    setProductId(product.id);
    setProductNameInputDisabled(true);
    setIsDropdownOpen(false);
  };

  const resetForm = () => {
    form.reset();
    setProductId("");
    setProductNameInputDisabled(false);
    setIsResetDisabled(true);
    onReset();
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      modelId,
      referenceNumber: values.referenceNumber,
    });
    setDialogOpen(false);
  }

  const { pending } = useFormStatus();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem className="mb-1">
              <FormLabel>Product</FormLabel>
              <FormControl>
                <InputDropdown<Product>
                  isOpen={isDropdownOpen}
                  onToggle={setIsDropdownOpen}
                  options={products}
                  onSelectOption={handleSelectOption}
                  onInputChange={handleInputChange}
                  placeholder="Type to create new Product"
                  value={field.value}
                  isDisabled={isProductNameInputDisabled}
                  optionLabel="referenceNumber"
                  isLoading={isLoading}
                />
              </FormControl>
              {!productId && (
                <FormDescription>
                  Select from the dropdown after creating a new entry, or choose an existing one.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {!productId && (
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
              Create Product
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="space-y-6">
            <DialogHeader>
              <DialogTitle>Create New Product?</DialogTitle>
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


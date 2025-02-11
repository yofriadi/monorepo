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
import { getQueryClient } from '@/lib/providers/get-query-client'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { Product, productOptions, createProductMutationConfig } from "../queries/product";

const formSchema = z.object({
  referenceNumber: z.string().min(3, {
    message: "Minimum 3 characters or select from dropdown.",
  }),
});

interface FormProductProps {
  modelId: string;
  productId: string;
  setProductId: (modelId: string) => void;
}

export function FormProduct({ modelId, productId, setProductId }: FormProductProps) {
  const { data: products = [] } = useSuspenseQuery(productOptions(modelId));
  const [isProductNameInputDisabled, setProductNameInputDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(true);
  const [filteredOptions, setFilteredOptions] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = getQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceNumber: "",
    },
  });

  useEffect(() => {
    setFilteredOptions(products);
  }, [products]);

  const createProduct = useMutation({
    ...createProductMutationConfig,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['models', modelId] });
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
        description: "Failed to create product",
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
    if (newIsOpen && !products.length) {
      await queryClient.fetchQuery(productOptions(modelId));
    }
    setIsDropdownOpen(newIsOpen);
  };

  const handleInputChange = (value: string) => {
    form.setValue("referenceNumber", value);
    setFilteredOptions(
      products.filter((option) =>
        option.referenceNumber.toLowerCase().includes(value.toLowerCase())
      )
    );
    setProductNameInputDisabled(false);
  };

  const handleSelectOption = (product: Product) => {
    form.setValue("referenceNumber", product.referenceNumber);
    setProductId(product.id);
    setProductNameInputDisabled(true);
    setIsDropdownOpen(false);
  };

  function resetForm() {
    form.reset();
    setProductId("");
    setProductNameInputDisabled(false);
    setIsResetDisabled(true);
    setFilteredOptions(products);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    createProduct.mutate({
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
                  onToggle={handleToggleDropdown}
                  options={products}
                  filteredOptions={filteredOptions}
                  onSelectOption={handleSelectOption}
                  onInputChange={handleInputChange}
                  placeholder="Type to create new Product"
                  value={field.value}
                  isDisabled={isProductNameInputDisabled}
                  optionLabel="referenceNumber"
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


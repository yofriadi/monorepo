import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "@workspace/ui/hooks/use-toast";

interface UpdateTurnoverParams {
  productId: string;
  newTurnover: string | null;
}

const updateTurnoverCategoryFn = async ({ productId, newTurnover }: UpdateTurnoverParams) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ turnoverCategory: newTurnover }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update turnover category: ${response.statusText}`);
  }

  return response.json();
};

export const useUpdateTurnoverCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTurnoverCategoryFn,
    onSuccess: (_, variables) => {
      const snapshotsCache = queryClient.getQueryData(['snapshots']) as any[] | undefined;
      const productsCache = queryClient.getQueryData(['products']) as any[] | undefined;

      let productName = 'Unknown Product';
      if (snapshotsCache) {
        const snapshot = snapshotsCache.find(s => s.productId === variables.productId);
        if (snapshot) productName = snapshot.referenceNumber;
      } else if (productsCache) {
        const product = productsCache.find(p => p.id === variables.productId);
        if (product) productName = product.referenceNumber;
      }

      queryClient.setQueryData(['snapshots'], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((snapshot) =>
          snapshot.productId === variables.productId
            ? { ...snapshot, turnoverCategory: variables.newTurnover }
            : snapshot
        );
      });

      queryClient.setQueryData(['products'], (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((product) =>
          product.id === variables.productId
            ? { ...product, turnoverCategory: variables.newTurnover }
            : product
        );
      });

      toast({
        title: "Turnover Category Updated",
        description: `Turnover category for product ${productName} set to ${variables.newTurnover || "Not Set"}`,
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Error updating turnover category:', error);
      toast({
        title: "Error",
        description: "Failed to update turnover category",
        variant: "destructive",
        duration: 2000,
      });
    },
  });
};
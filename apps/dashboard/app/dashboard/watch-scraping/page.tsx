"use client"

import { useState } from "react"

import { getQueryClient } from "@/lib/providers/get-query-client";
import { brandOptions } from "./queries/brand";
import { FormBrand } from "./components/form-brand"
import { FormModel } from "./components/form-model"
import { FormProduct } from "./components/form-product"
import { FormSource } from "./components/form-source"

export default function Create() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(brandOptions)

  const [brandId, setBrandId] = useState<string>("")
  const [modelId, setModelId] = useState<string>("")
  const [productId, setProductId] = useState<string>("")
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <FormBrand brandId={brandId} setBrandId={setBrandId} />
      {!!brandId && <FormModel brandId={brandId} modelId={modelId} setModelId={setModelId} />}
      {!!modelId && <FormProduct modelId={modelId} productId={productId} setProductId={setProductId} />}
      {!!productId && <FormSource productId={productId} />}
    </div>
  )
}

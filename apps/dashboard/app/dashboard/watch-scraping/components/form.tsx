"use client"

import { useState } from "react"

import { FormBrand } from "./form-brand"
import { FormModel } from "./form-model"
import { FormProduct } from "./form-product"
import { FormSource } from "./form-source"
import { Brand } from "../actions/brand"

export function Form({ brands }: { brands: Brand[] }) {
  const [brandId, setBrandId] = useState<string>("")
  const [modelId, setModelId] = useState<string>("")
  const [productId, setProductId] = useState<string>("")
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <FormBrand initialData={brands} brandId={brandId} setBrandId={setBrandId} />
      {!!brandId && <FormModel brandId={brandId} modelId={modelId} setModelId={setModelId} />}
      {!!modelId && <FormProduct modelId={modelId} productId={productId} setProductId={setProductId} />}
      {!!productId && <FormSource productId={productId} />}
    </div>
  )
}

"use client"

import { useState } from "react"
import { FormBrand } from "./form-brand"
import { FormModel } from "./form-model"
import { FormProduct } from "./form-product"
import { FormSource } from "./form-source"

export function Form() {
  const [brandId, setBrandId] = useState<string>("")
  const [modelId, setModelId] = useState<string>("")
  const [productId, setProductId] = useState<string>("")

  const resetAllStates = () => {
    setBrandId("")
    setModelId("")
    setProductId("")
  }

  const resetFromModel = () => {
    setModelId("")
    setProductId("")
  }

  const resetFromProduct = () => {
    setProductId("")
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <FormBrand 
        brandId={brandId} 
        setBrandId={setBrandId} 
        onReset={resetAllStates} 
      />
      {!!brandId && (
        <FormModel 
          brandId={brandId} 
          modelId={modelId} 
          setModelId={setModelId} 
          onReset={resetFromModel}
        />
      )}
      {!!modelId && (
        <FormProduct 
          modelId={modelId} 
          productId={productId} 
          setProductId={setProductId} 
          onReset={resetFromProduct}
        />
      )}
      {!!productId && <FormSource productId={productId} />}
    </div>
  )
}

import { getBrands } from "./actions/brand";
import { Form } from "./components/form";

export default async function Page() {
  const brands = await getBrands()
  return <Form brands={brands} />
}

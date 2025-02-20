import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'

import { brand } from "./brand";
import { model } from "./model";
import { product } from "./product";
import { source } from "./source";
import { snapshot } from "./snapshot";
import { lookupPrice } from "./lookup-price";

const app = new Elysia({ prefix: '/api' })
  .use(swagger())
  .onError(({ error , code }) => { 
    if (code === 'NOT_FOUND') return
      console.error(error) 
    })
  .use(brand)
  .use(model)
  .use(product)
  .use(source)
  .use(snapshot)
  .use(lookupPrice)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

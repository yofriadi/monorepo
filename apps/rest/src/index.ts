import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'

import { brand } from "./brand";
import { model } from "./model";
import { product } from "./product";
import { source } from "./source";
import { snapshot } from "./snapshot";

const app = new Elysia()
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
  .listen(3002);

// Testing build image
console.log(`REST API is running at ${app.server?.hostname}:${app.server?.port}`);

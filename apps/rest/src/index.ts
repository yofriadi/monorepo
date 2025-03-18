import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { health } from './api/health';
import { brand } from "./api/brand";
import { model } from "./api/model";
import { product } from "./api/product";
import { source } from "./api/source";
import { snapshot } from "./api/snapshot";

const app = new Elysia()
  .use(swagger({
    path: '/api/swagger',
    documentation: {
      info: {
        title: 'Scraping Documentation',
        version: '1.0.0',
      },
      tags: [
          { name: 'Brand', description: 'Brand endpoints' },
          { name: 'Model', description: 'Model endpoints' },
          { name: 'Product', description: 'Product endpoints' },
          { name: 'Source', description: 'Source endpoints' },
          { name: 'Snapshot', description: 'Snapshot endpoints' },
      ]
    },
  }))
  .onError(({ error , code }) => { 
    if (code === 'NOT_FOUND') return
      console.error(error) 
    })
  .group("/api/scraping", app => app
    .use(health)
    .use(brand)
    .use(model)
    .use(product)
    .use(source)
    .use(snapshot)
  ).listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

# Integration Examples

This document shows how to use `schema-dts` types with popular frameworks and
related tools. Most sections demonstrate runtime approaches to injecting typed
JSON-LD into your pages, and the last section points to adjacent tooling you can
use alongside `schema-dts`.

## React — react-schemaorg

[`react-schemaorg`](https://github.com/google/react-schemaorg) provides a
`<JsonLd>` component that handles XSS-safe serialization automatically.

```tsx
import {JsonLd} from 'react-schemaorg';
import type {Product} from 'schema-dts';

export function ProductPage() {
  return (
    <JsonLd<Product>
      item={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Classic Leather Wallet',
        offers: {
          '@type': 'Offer',
          price: 89,
          priceCurrency: 'USD',
        },
      }}
    />
  );
}
```

## Next.js — Script component

Next.js provides a built-in `<Script>` component. Pair it with a helper that
escapes characters that could break out of a `<script>` tag.

```tsx
import Script from 'next/script';
import type {Article, WithContext} from 'schema-dts';

function safeJsonLd(data: WithContext<Article>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');
}

export default function BlogPost() {
  const article: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to choose a leather wallet',
    datePublished: '2025-03-01',
    author: {'@type': 'Person', name: 'Jane Smith'},
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: safeJsonLd(article)}}
      />
      <article>{/* page content */}</article>
    </>
  );
}
```

## Astro — inline `<script>` tag

In Astro, you can render JSON-LD directly in a component's template. The same
escaping helper keeps the output XSS-safe.

```astro
---
import type {FAQPage, WithContext} from 'schema-dts';

const faq: WithContext<FAQPage> = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you ship internationally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we ship to over 50 countries.',
      },
    },
  ],
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');
}
---

<script type="application/ld+json" set:html={safeJsonLd(faq)} />
```

## Svelte — `<svelte:head>`

Svelte lets you inject into `<head>` with `<svelte:head>`. Use the same
escaping pattern.

```svelte
<script lang="ts">
  import type {Organization, WithContext} from 'schema-dts';

  const org: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acme Corp',
    url: 'https://acme.com',
    logo: 'https://acme.com/logo.png',
  };

  function safeJsonLd(data: object): string {
    return JSON.stringify(data)
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/&/g, '\\u0026')
      .replace(/'/g, '\\u0027');
  }
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${safeJsonLd(org)}</script>`}
</svelte:head>
```

## Framework-agnostic — vanilla TypeScript

If you are not using a framework, you can create and inject the `<script>` tag
directly.

```ts
import type {WebSite, WithContext} from 'schema-dts';

const site: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Acme Corp',
  url: 'https://acme.com',
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(site);
document.head.appendChild(script);
```

## Other tooling

Some projects also pair `schema-dts` with tooling that either injects JSON-LD
at build time or generates custom Schema.org-compatible typings:

- [**agentmarkup**](https://github.com/agentmarkup/agentmarkup) — Vite and
  Astro plugins for automatic JSON-LD injection and validation.
- [**schema-dts-gen**](https://www.npmjs.com/package/schema-dts-gen) — Generate
  custom typings from any Schema.org–compatible ontology.

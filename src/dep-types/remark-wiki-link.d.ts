declare module 'remark-wiki-link' {
  export function wikiLinkPlugin(opts?: {
    permalinks?: string;
    pageResolver?: (l: string) => string[];
    hrefTemplate?: (l: string) => string;
    wikiLinkClassName?: string;
    newClassName?: string;
    aliasDivider?: string;
  }): void;
}

declare module 'remark-wiki-link' {
  // eslint-disable-next-line import/no-default-export
  export default function wikiLinkPlugin(opts?: {
    permalinks?: string;
    pageResolver?: (l: string) => string[];
    hrefTemplate?: (l: string) => string;
    wikiLinkClassName?: string;
    newClassName?: string;
    aliasDivider?: string;
  }): void;
}

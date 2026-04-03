import { browser } from 'wxt/browser';

type Substitutions = string | string[];

export function t(messageName: string, substitutions?: Substitutions) {
  return browser.i18n.getMessage(messageName, substitutions as string | string[]) || messageName;
}
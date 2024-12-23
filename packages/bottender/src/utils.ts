import {
  camelcaseKeys as baseCamelcaseKeys,
  camelcaseKeysDeep as baseCamelcaseKeysDeep,
} from 'messaging-api-common';

import { DeepCamelCase } from './types';

export function camelcaseKeys<T extends object>(obj: T): DeepCamelCase<T> {
  return baseCamelcaseKeys(obj) as any;
}

export function camelcaseKeysDeep<T extends object>(obj: T): DeepCamelCase<T> {
  return baseCamelcaseKeysDeep(obj) as any;
}

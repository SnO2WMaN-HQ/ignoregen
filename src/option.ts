import {Option} from '@ignoregen/core';
import {cosmiconfig} from 'cosmiconfig';

export async function getConfig(pwd: string): Promise<Partial<Option>> {
  const explorer = cosmiconfig('ignoregen');
  const result = await explorer.search(pwd);
  return result?.config || {};
}

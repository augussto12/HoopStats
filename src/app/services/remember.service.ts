import { Injectable } from '@angular/core';
import { AppStorageService } from './app-storage.service';

const KEY_IDENTIFIER = 'remember_identifier';
const KEY_REMEMBER = 'remember_enabled';

@Injectable({ providedIn: 'root' })
export class RememberService {
  constructor(private storage: AppStorageService) {}

  async load(): Promise<{ remember: boolean; identifier: string }> {
    const rememberVal = await this.storage.get(KEY_REMEMBER);
    const idVal = await this.storage.get(KEY_IDENTIFIER);

    const remember = rememberVal === 'true';
    const identifier = (idVal ?? '');

    return { remember, identifier: remember ? identifier : '' };
  }

  async save(remember: boolean, identifier: string): Promise<void> {
    // Esto es una preferencia, lo guardo siempre persistente
    await this.storage.set(KEY_REMEMBER, String(remember), true);

    if (remember) {
      await this.storage.set(KEY_IDENTIFIER, identifier, true);
    } else {
      await this.storage.remove(KEY_IDENTIFIER);
    }
  }

  async clear(): Promise<void> {
    await this.storage.remove(KEY_REMEMBER);
    await this.storage.remove(KEY_IDENTIFIER);
  }
}

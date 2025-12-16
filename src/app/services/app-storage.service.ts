import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AppStorageService {
    private isNative = Capacitor.isNativePlatform();

    async get(key: string): Promise<string | null> {
        if (this.isNative) {
            const { value } = await Preferences.get({ key });
            return value ?? null;
        }
        return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    }

    async set(key: string, value: string, remember: boolean): Promise<void> {
        if (this.isNative) {
            // En mobile lo guardamos siempre en Preferences (persistente)
            await Preferences.set({ key, value });
        } else {
            const st = remember ? localStorage : sessionStorage;
            st.setItem(key, value);
        }
    }

    async remove(key: string): Promise<void> {
        if (this.isNative) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        }
    }
}

import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';          // ⬅️ ambil default app dari AngularFire
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirebaseMessagingService {

  private readonly messaging: Messaging;

  constructor() {
    // ✅  Angular sudah membuat default‑app lewat provider `provideFirebaseApp`
    const app = inject(FirebaseApp);          // ← instance '[DEFAULT]' pasti ada di sini
    this.messaging = getMessaging(app);       // ← bangun Messaging di atas app tsb
  }

  async checkNotificationPermission(): Promise<void> {
    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      console.warn('[FCM] User blocked notification permission');
      alert('Notifikasi diblokir oleh browser. Silakan izinkan notifikasi di pengaturan browser.');
    } else if (permission === 'default') {
      console.warn('[FCM] User dismissed permission prompt');
    } else {
      console.log('[FCM] Notification permission granted');
    }
  }

  /** Minta izin & ambil FCM token */
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
        const permission = await Notification.requestPermission();
        console.log('[FCM] Notification permission:', permission);

        if (permission !== 'granted') {
            console.warn('[FCM] Permission not granted');
            return null;
        }

        const token = await getToken(this.messaging, {
            vapidKey: environment.firebaseConfig.vapidKey,
        });

        if (token) {
            console.log('[FCM] Token:', token);
            return token;
        } else {
            console.warn('[FCM] No token returned by getToken()');
            return null;
        }
    } catch (err) {
        console.error('[FCM] Error retrieving token:', err);
        return null;
    }
  }


  /** Listener pesan ketika tab aktif */
  onMessage(cb: (payload: any) => void) {
    onMessage(this.messaging, cb);
  }
}

// src/environments/environment.ts
export const environment = {
    production: false,
    apiKey: 'TEST API KEY',
    backendApiUrl: 'http://localhost:8001', // URL untuk generate IDs
    websocketUrl: 'ws://localhost:8001/ws/chat', // URL untuk koneksi WebSocket
    backendWsUrl: 'ws://localhost:8001/ws', // URL untuk koneksi WebSocket umum

    firebaseConfig: {
      apiKey: "AIzaSyBtCD7AiBx18mDe4P3Pnb_pJrP9YdmE2N4",
      authDomain: "talkvera-ae907.firebaseapp.com",
      projectId: "talkvera-ae907",
      storageBucket: "talkvera-ae907.firebasestorage.app",
      messagingSenderId: "400690975329",
      appId: "1:400690975329:web:d39b8174e8ae76a6a79020",
      measurementId: "G-LJJLZRY273",

      vapidKey: "BBFrJcREu6cXnIa7fwgd5aljpp7oDuXNRp7qwR9ZAHDUm1m5zA0tsKaIhXI_QieIR_T8uwsaXEs8x66DAtUAM6U"
    }
  };
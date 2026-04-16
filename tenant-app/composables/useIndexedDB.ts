const DB_NAME = 'spatium-facility-db';
const STORE_NAME = 'settings';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
};

export const useIndexedDB = () => {
    const setItem = async (key: string, value: any): Promise<void> => {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put({ key, value: JSON.stringify(value) });
        } catch (error) {
            console.error('IndexedDB setItem error:', error);
        }
    };

    const getItem = async <T>(key: string): Promise<T | null> => {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            
            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => {
                    if (request.result) {
                        resolve(JSON.parse(request.result.value) as T);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('IndexedDB getItem error:', error);
            return null;
        }
    };

    const removeItem = async (key: string): Promise<void> => {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.delete(key);
        } catch (error) {
            console.error('IndexedDB removeItem error:', error);
        }
    };

    return {
        setItem,
        getItem,
        removeItem
    };
};

export const HELPDESK_FACILITY_KEY = 'helpdesk-selected-facility';
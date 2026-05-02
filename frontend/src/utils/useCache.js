import WebStorageCache from 'web-storage-cache';
export const useCache = (type = 'localStorage') => {
    const wsCache = new WebStorageCache({
        storage: type,
    });
    return {
        wsCache,
    };
};

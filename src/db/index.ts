
import {proResolver} from "@the_library/db";

const dbDeferred = proResolver<IDBDatabase>();
const dbName = "datapond_lib_builder"
const version = 1

const invalidBookCoverStoreName = "invalid_book_covers"

export const Db = (): Promise<IDBDatabase> => {
    if (dbDeferred.isStarted()) {
        return dbDeferred.pro
    }
    dbDeferred.start();

    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = function () {
        const db = request.result;
        db.createObjectStore(invalidBookCoverStoreName, {keyPath: "id"});
    }

    request.onerror = function (event) {
        dbDeferred.reject(event)
    };

    request.onsuccess = function (event: Event) {
        // @ts-ignore
        dbDeferred.resolve(event.target.result)
    };
    return dbDeferred.pro
}


export type InvalidCoverRecord = {
    id: number,
    alternativeCoverName: string
}

export const addInvalidBookCover = async (bookId: number): Promise<true> => {
    const deferred = proResolver<true>();

    const db = await Db()
    const tx = db.transaction(invalidBookCoverStoreName, "readwrite");

    tx.objectStore(invalidBookCoverStoreName).add({id: bookId, alternativeCoverName: ""})
    tx.oncomplete = () => {
        deferred.resolve(true)
    }
    tx.onerror = (e) => {
        deferred.reject(e)
    }
    return deferred.pro
}
export const clearInvalidCovers = async(): Promise<true> => {
    const deferred = proResolver<true>()
    const db = await  Db()

    const tx =  db.transaction(invalidBookCoverStoreName, "readwrite")
    tx.objectStore(invalidBookCoverStoreName).clear();
    tx.oncomplete = function (e) {
        deferred.resolve(true)
    }
    tx.onerror = function (e) {
        deferred.reject(e)
    }
    return deferred.pro
}
export const setBookCover = async (bookId: number, cover: string) => {
    const deferred = proResolver();
    const db = await Db()
    const tx = db.transaction(invalidBookCoverStoreName, "readwrite");
    tx.objectStore(invalidBookCoverStoreName).put({id: bookId, alternativeCoverName: cover})
    tx.oncomplete = (e) => {
        deferred.resolve(true)
    }
    tx.onerror =(e) => {
        deferred.reject(e)
    }
    return deferred.pro;
}

const loadInvalidBookCovers = async (): Promise<Array<InvalidCoverRecord>> => {
    const deferred = proResolver<InvalidCoverRecord[]>()
    const db = await  Db()

    const tx =  db.transaction(invalidBookCoverStoreName, "readonly")
    tx.objectStore(invalidBookCoverStoreName).getAll().onsuccess = function (e) {
        deferred.resolve(e.target.result)
    }
    tx.onerror = function (e) {
        deferred.reject(e)
    }
    return deferred.pro
}


export const isInvalidCover = async (id:number): Promise<boolean> => {
    const deferred = proResolver<boolean>()
    try {
        const db = await Db()
        const tx = db.transaction(invalidBookCoverStoreName, "readonly");
        const req = tx.objectStore(invalidBookCoverStoreName).openCursor(id);
        req.onsuccess = function (e) {
            // @ts-ignore
            const cursor = e.target.result;
            if (cursor) { // key already exist
                deferred.resolve(true)
            } else { // key not exist
                deferred.resolve(false)
            }
        };
        req.onerror = function (e) {
            console.error("worker: error", e.target)
            deferred.reject(e.target)
        }
    } catch(e) {
        deferred.reject(e)
    }
    return deferred.pro
}

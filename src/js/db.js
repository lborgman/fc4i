let db;

const openRequest = indexedDB.open('remembers', 1);

openRequest.onupgradeneeded = function (e) {
    db = e.target.result;
    console.log('running onupgradeneeded');
    const storeOS = db.createObjectStore('myDatabaseStore',  {keyPath: "name"});
 };
openRequest.onsuccess = function (e) {
    console.log('running onsuccess');
    db = e.target.result;
};
openRequest.onerror = function (e) {
    console.log('onerror! doesnt work');
};

// データベースを開く
var db;
var version = 1;
var request = window.indexedDB.open("TestDatabase", version);
request.onerror = function(event) {
  console.log(event);
};
request.onsuccess = function(event) {
  db = event.target.result;
  db.transaction("hatchList", "readwrite").objectStore("hatchList").clear();
};
request.onupgradeneeded = function(event) {
  db = event.target.result;
  var objectStore = db.createObjectStore("hatchList", { keyPath: "no" });
  objectStore.createIndex("no", "no", { unique: true }); 
  objectStore.createIndex("rng", "rng", { unique: false }); 
  objectStore.createIndex("gender", "gender", { unique: false });
  objectStore.createIndex("nature", "nature", { unique: false }); 
  objectStore.createIndex("ability", "ability", { unique: false });
  objectStore.createIndex("ball", "ball", { unique: false });
  objectStore.createIndex("H", "H", { unique: false });
  objectStore.createIndex("A", "A", { unique: false });
  objectStore.createIndex("B", "B", { unique: false });
  objectStore.createIndex("C", "C", { unique: false });
  objectStore.createIndex("D", "D", { unique: false });
  objectStore.createIndex("S", "S", { unique: false });
  objectStore.createIndex("PSV", "PSV", { unique: false });
  objectStore.createIndex("CSP", "CSP", { unique: false });
  objectStore.createIndex("ENC", "ENC", { unique: false });
  objectStore.createIndex("PID", "PID", { unique: false });
};
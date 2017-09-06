const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');
const Encryption = require('../lib/encryption');
var Crypto = require('iota.crypto.js');

const iota = new IOTA({
  provider: 'http://localhost:14600'
});

const seed = 'PAUL9NOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
//const message = "\"'I'm here for you in the same way that you're here for me, each person is an intricate piece of infinity. -Eyedea\" - Dukakis";
const message = "\"'I'm still here for IOTA in the same way that you're here for me, each person is an intricate piece of infinity. -Eyedea\" - Dukakis";
const channelKeyIndex = 3;
const channelKey = Crypto.converter.trytes(Encryption.hash(Encryption.increment(Crypto.converter.trits(seed.slice()))));
const start = 3;
const count = 4;
const security = 1;

const tree0 = new MerkleTree(seed, start, count, security);
const tree1 = new MerkleTree(seed, start + count, count, security);
let index = 0;

// Get the trytes of the MAM transactions
const mam = new MAM.create({
    message: iota.utils.toTrytes(message),
    merkleTree: tree0,
    index: index,
    nextRoot: tree1.root.hash.toString(),
    channelKey: channelKey,
});

// Depth
const depth = 4;

// minWeighMagnitude
const minWeightMagnitude = 13;

console.log("Next Key: " + mam.nextKey);

// Send trytes
iota.api.sendTrytes(mam.trytes, depth, minWeightMagnitude, (err, tx) => {
  if (err)
    console.log(err);
  else
    console.log(tx);
});

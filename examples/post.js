const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');
const Encryption = require('../lib/encryption');

const iota = new IOTA({
  provider: 'http://localhost:14700'
});

const seed = 'PAULUNOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
/*
const seed = 'UYRCUNOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
const encryptionSeed = 'JLHQLDCYRVNJVOOUQ9DDZXJYOQVODPXS9XPXDLTLAOIAYANJZOM9KHLFUVLARJKLBVH9GPYFKKACWRUQL';
*/
const message = "moshi moshi";
const encryptionKeyIndex = 1;
const channelKeyIndex = 1;
const start = 3;
const count = 4;
const security = 1;

const tree0 = new MerkleTree(seed, start, count, security);
const tree1 = new MerkleTree(seed, start + count, count, security);
let index = 1;

// Get the trytes of the MAM transactions
const trytes = new MAM.MaskedAuthenticatedMessage({
    message: iota.utils.toTrytes(message),
    merkleTree: tree0,
    nextRoot: tree1.root.hash.toString(),
    channelKey: seed,
    channelKeyIndex: channelKeyIndex,
    encryptionKeyIndex: encryptionKeyIndex,
    index: index
});

// Depth
const depth = 4;

// minWeighMagnitude
const minWeightMagnitude = 9;

// Send trytes
iota.api.sendTrytes(trytes, depth, minWeightMagnitude, (err, tx) => {
  if (err)
    console.log(err);
  else
    console.log(tx);
});

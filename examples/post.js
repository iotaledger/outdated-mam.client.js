const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');
const Encryption = require('../lib/encryption');
var Crypto = require('crypto.iota.js');

const iota = new IOTA({
  provider: 'http://localhost:14700'
});

const seed = 'PAULUNOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
//const message = "\"'I'm here for you in the same way that you're here for me, each person is an intricate piece of infinity. -Eyedea\" - Dukakis";
const message = "\"'I'm still here for IOTA in the same way that you're here for me, each person is an intricate piece of infinity. -Eyedea\" - Dukakis";
const channelKeyIndex = 3;
const channelKey = Crypto.converter.trytes(Encryption.subseed(Encryption.hash(Encryption.increment(Crypto.converter.trits(seed.slice()))), channelKeyIndex));
const start = 3;
const count = 4;
const security = 1;

const tree0 = new MerkleTree(seed, start, count, security);
const tree1 = new MerkleTree(seed, start + count, count, security);
let index = 0;

// Get the trytes of the MAM transactions
const trytes = new MAM.MaskedAuthenticatedMessage({
    message: iota.utils.toTrytes(message),
    merkleTree: tree0,
    index: index,
    nextRoot: tree1.root.hash.toString(),
    channelKey: channelKey,
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

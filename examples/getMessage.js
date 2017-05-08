const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');
const Encryption = require('../lib/encryption');
var Crypto = require('crypto.iota.js');

const iota = new IOTA({
  provider: 'http://localhost:14700'
});

const seed = 'PAULUNOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
const channelKeyIndex = 3;
const channelKey = Crypto.converter.trytes(Encryption.subseed(Encryption.hash(Encryption.increment(Crypto.converter.trits(seed.slice()))), channelKeyIndex));
const start = 3;
const count = 4;
const security = 1;

const tree0 = new MerkleTree(seed, start, count, security);

const root = tree0.root.hash.toString();
iota.api.sendCommand({ 
    command: "MAM.getMessage",
    channel: MAM.messageID(channelKey)
}, function(e, result) {
    if(e == undefined) {
        const output = MAM.parse(result.ixi, {key: channelKey});
        const asciiMessage = iota.utils.fromTrytes(output.message);
        if (root === output.root) {
            console.log("Public key match for " + root); 
        }
        console.log("received: " + asciiMessage);
    }
});
const IOTA = require('iota.lib.js');
const MAM = require('../lib/mam');
const MerkleTree = require('../lib/merkle');

const iota = new IOTA({
  provider: 'http://localhost:14700'
});

const seed = 'PAULUNOZTUVHPBKLTFVRJZTOPODGTYHRUIACDYDKRNAQMCUZGNWMDSDZMPWHKQINYFPYTIEDSZ9EJZYOD';
const message = "moshi moshi";
const encryptionKeyIndex = 1;
const channelKeyIndex = 1;
const start = 3;
const count = 4;
const security = 1;

const tree0 = new MerkleTree(seed, start, count, security);
const tree1 = new MerkleTree(seed, start + count, count, security);
let index = 1;

const root = tree0.root.hash.toString();
iota.api.sendCommand({ 
    command: "MAM.getMessage",
    channel: MAM.messageID(seed)
}, function(e, result) {
    if(e == undefined) {
        const output = MAM.parse(result.ixi, {seed: seed});
        const asciiMessage = iota.utils.fromTrytes(output.message);
        if (root === output.root) {
            console.log("Public key match for " + root); 
        }
        console.log("received: " + asciiMessage);
    }
});
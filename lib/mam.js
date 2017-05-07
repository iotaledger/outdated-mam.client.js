const Crypto = require('crypto.iota.js');
const Encryption = require('./encryption');

const HASH_LENGTH = 243;
const NULL_HASH_TRYTES = new Array(81).join('9');

function buffer(array, value, size) {
    const remaining = array.length % size;
    const copy = array.slice();
    for(let i = 0; i < remaining; i++) {
        copy.concat(value);
    }
    return copy;
}

function bufferLength(length) {
    return 2187 - ( length - Math.floor(length/2187)*2187 )
}

const MaskedAuthenticatedMessage = function (options) {

    const treeSize = options.merkleTree.root.size();
    const keyIndex = options.index % treeSize;
    const key = options.merkleTree.get(keyIndex);

    let tree = key.tree.reduce((a, b) => {
        var h = b.hash.value;
        var c = a.concat(h);
        return c;
    }, []);

    tree = Crypto.converter.trytes(tree).concat(Array(81).fill('9').join(''));

    let messageTrytes = options.nextRoot.concat(options.message);
    const treeTrytes = key.tree.toString().concat(NULL_HASH_TRYTES);
    //var treelen = treeTrytes.length;
    messageTrytes = messageTrytes.concat(new Array(bufferLength(messageTrytes.length + tree.length)).fill('9').join(''));

    const hash = new Int32Array(HASH_LENGTH);
    const channel = new Int32Array(HASH_LENGTH);

    const transfers = [];
    const curl = new Crypto.curl();
    const channelTrits = Crypto.converter.trits(options.channelKey);

    curl.initialize();
    curl.absorb(channelTrits, 0, channelTrits.length);
    curl.squeeze(channel, 0, channel.length);
    curl.absorb(channel, 0, channel.length);
    curl.squeeze(channel, 0, channel.length);

    curl.initialize();
    curl.absorb(messageTrytes, 0, messageTrytes.length);
    curl.squeeze(hash, 0, hash.length);

    const bundle = new Crypto.bundle();
    const signature = Crypto.signing.signatureFragment(bundle.normalizedBundle(Crypto.converter.trytes(hash))[0], Crypto.converter.trytes(key.key.key));
    const messageOut = signature.concat(tree).concat(messageTrytes);
    const encryptionkey = Encryption.key(options.channelKey, options.encryptionKeyIndex, options.channelKeyIndex, messageOut.length*3);
    const cipher = Encryption.encrypt(messageOut, encryptionkey);

    const signatureMessageLength = Math.ceil(cipher.length / 2187);
    const signatureFragments = [cipher];
    const address = Crypto.converter.trytes(channel);
    const value = 0;
    const tag = Crypto.converter.trytes(Crypto.converter.fromValue(options.index));
    const timestamp = Math.floor(Date.now() / 1000);

    bundle.addEntry(signatureMessageLength, address, value, tag, timestamp);
    bundle.finalize();
    bundle.addTrytes(signatureFragments);

    
    const trytes = bundle.bundle.map((tx) => Crypto.transactionTrytes(tx));

    return trytes;
}

module.exports = {
    MaskedAuthenticatedMessage
};

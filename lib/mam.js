const Crypto = require('crypto.iota.js');
const Encryption = require('./encryption');
const MerkleTree = require('./merkle');

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

const sign = function (message, key, bundle) {
    if(bundle == null) {
        bundle = new Crypto.bundle();
    }
    const normalizedHash = bundle.normalizedBundle(messageHash(message)).slice(0,27);
    return Crypto.signing.signatureFragment(normalizedHash, key);
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


    const transfers = [];

    const hash = messageHash(messageTrytes);
    const bundle = new Crypto.bundle();
    const signature = sign(messageTrytes, key.key.key, bundle);

    const messageOut = Crypto.converter.trytes(signature).concat(tree).concat(messageTrytes);
    const encryptionkey = Encryption.key(options.channelKey, messageOut.length*3);
    const cipher = Encryption.encrypt(messageOut, encryptionkey);

    const signatureFragments = cipher.match(/.{1,2187}/g);
    const address = messageID(options.channelKey, options.channelKeyIndex, options.channelKeyIndex);//Crypto.converter.trytes(channel);
    const value = 0;
    const indextrits = Crypto.converter.fromValue(options.index);
    const indexTrytes = Crypto.converter.trytes(indextrits.concat(new Array(Math.ceil(indextrits.length/3)*3 - indextrits.length).fill(0)));
    const tag = indexTrytes.concat('999999999999999999999999999').substring(0, 27);
    const timestamp = Math.floor(Date.now() / 1000);

    bundle.addEntry(signatureFragments.length, address, value, tag, timestamp);
    bundle.finalize();
    bundle.addTrytes(signatureFragments);
    
    const trytes = bundle.bundle.map((tx) => Crypto.transactionTrytes(tx));
    const l = trytes[0].length;

    return trytes.reverse();
}

const messageHash = function (message) {
    const curl = new Crypto.curl();
    const hash = new Int32Array(HASH_LENGTH);
    const messageTrits = Crypto.converter.trits(message);
    curl.initialize();
    curl.absorb(messageTrits, 0, messageTrits.length);
    curl.squeeze(hash, 0, hash.length);
    return Crypto.converter.trytes(hash);
}

const validationHashes = function(message) {

}

const messageID = function (channelKey, keyIndex) {
    const curl = new Crypto.curl();
    const channel = new Int32Array(Crypto.converter.trits(channelKey));
    Encryption.hash(channel);
    Encryption.hash(channel);
    return Crypto.converter.trytes(channel);
}

const reverse = s => s.split("").reverse().join("");

const parse = function(result, options) {
    const cipher = result.message.join('');
    const key = Encryption.key(options.key, cipher.length*3);
    const messages = Encryption.decrypt(cipher, key).match(/.{1,2187}/g);
    const signature = messages.shift();
    const afterSignature = messages.join('');
    let hashes = afterSignature.match(/^(?:(?![9]{81}).{81})*(?=[9]{81})/).map( m => m.match(/.{81}/g)).shift();
    const signedPortion = reverse(afterSignature).match(/.*(?=[9]{81})/).map(reverse).shift();
    const nextRoot = signedPortion.substring(0,81);
    var bundle = new Crypto.bundle();
    const normalizedHash = bundle.normalizedBundle(messageHash(signedPortion)).slice(0, 27);
    const signingKey = Crypto.signing.address(Crypto.signing.digest(normalizedHash, Crypto.converter.trits(signature)))
    const root = Crypto.converter.trytes(MerkleTree.verify(signingKey, hashes.map(h => Crypto.converter.trits(h)), result.index));
    const message = signedPortion.substring(81).match(/^(?:(?![9]{81}).)*(?=[9]*)/).shift();
    return { root, signingKey, nextRoot, message }
}

module.exports = {
    MaskedAuthenticatedMessage,
    messageID,
    messageHash,
    sign,
    parse
};

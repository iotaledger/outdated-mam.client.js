const Crypto = require('iota.crypto.js');
const Encryption = require('./encryption');
const MerkleTree = require('./merkle');
const crypto = require('crypto');

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

function channelKey(seed, salt) {
    const key = seed.slice();
    const curl = new Crypto.curl();
    curl.initialize();
    Encryption.increment(key);
    return Encryption.hash(key, salt);
}

function generateSalt(length) {
  const salt = [];
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  while (length > 0) {
    let bytes;
    while (true) {
      try {
        bytes = crypto.randomBytes(Math.ceil(length * 256 / 243));
        break;
      }
      catch(e) {
        continue;
      }
    }
    for (let i = 0; i < bytes.length && length > 0; i++) {
      const byte = bytes.readUInt8(i);
      if (byte < 243) {
        salt.push(charset.charAt(byte % 27));
        length--;
      }
    }
  }
  return salt.join('');
}

const create = function (options) {

    const treeSize = options.merkleTree.root.size();
    const keyIndex = options.index % treeSize;
    const key = options.merkleTree.get(keyIndex);

    let tree = key.tree.reduce((a, b) => {
        var h = b.hash.value;
        var c = a.concat(h);
        return c;
    }, []);

    tree = Crypto.converter.trytes(tree).concat(Array(81).fill('9').join(''));

    const indexTrits = Crypto.converter.fromValue(options.index);
    const indexTrytes = Crypto.converter.trytes(indexTrits.concat(new Array(Math.ceil(indexTrits.length/3)*3 - indexTrits.length).fill(0))).concat('999999999999999999999999999').substr(0, 27);
    let messageTrytes = options.nextRoot.concat(options.message);
    const treeTrytes = key.tree.toString().concat(NULL_HASH_TRYTES);
    const salt = generateSalt(27);
    const checksum = "999999999";
    const length = bufferLength(messageTrytes.length + indexTrytes.length + tree.length + checksum.length);
    messageTrytes = messageTrytes.concat(new Array(length).fill('9').join(''));


    const transfers = [];

    const hash = messageHash(messageTrytes);
    const bundle = new Crypto.bundle();
    const signature = sign(messageTrytes, key.key.key, bundle);

    const messageOut = Crypto.converter.trytes(signature).concat(indexTrytes).concat(tree).concat(messageTrytes).concat(checksum);
    const cipher = Encryption.encrypt(messageOut, options.channelKey, salt);

    const signatureFragments = cipher.match(/.{1,2187}/g);
    const address = messageID(options.channelKey, options.channelKeyIndex, options.channelKeyIndex);//Crypto.converter.trytes(channel);
    const value = 0;
    const tag = salt; 
    const timestamp = Math.floor(Date.now() / 1000);

    bundle.addEntry(signatureFragments.length, address, value, tag, timestamp);
    bundle.finalize();
    bundle.addTrytes(signatureFragments);
    
    const trytes = bundle.bundle.map((tx) => Crypto.utils.transactionTrytes(tx)).reverse();
    const nextKey = Crypto.converter.trytes(channelKey(Crypto.converter.trits(options.channelKey), Crypto.converter.trits(salt)));
    return {trytes, nextKey};
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

const messageID = function (channelKey) {
    const curl = new Crypto.curl();
    const channel = new Int32Array(Crypto.converter.trits(channelKey));
    Encryption.hash(channel);
    Encryption.hash(channel);
    return Crypto.converter.trytes(channel);
}

const reverse = s => s.split("").reverse().join("");

const parse = function(options) {
    const cipher = options.message.join('');
    const salt = options.tag;
    const messages = Encryption.decrypt(cipher, options.key, salt).match(/.{1,2187}/g);
    const signature = messages.shift();
    const afterSignature = messages.join('');
    const index = Crypto.converter.value( Crypto.converter.trits( afterSignature.substr(0, 27 ) )  );
    let hashes = afterSignature.substring(27, afterSignature.length)
                    .match(/^(?:(?![9]{81}).{81})*(?=[9]{81})/)
                    .map( m => m.match(/.{81}/g))
                    .shift();
    const signedPortion = reverse(afterSignature).match(/.*(?=[9]{81})/).map(reverse).shift();
    const nextRoot = signedPortion.substring(0,81);
    var bundle = new Crypto.bundle();
    const normalizedHash = bundle.normalizedBundle(messageHash(signedPortion)).slice(0, 27);
    const signingKey = Crypto.signing.address(Crypto.signing.digest(normalizedHash, Crypto.converter.trits(signature)))
    const root = Crypto.converter.trytes(MerkleTree.verify(signingKey, hashes.map(h => Crypto.converter.trits(h)), index));
    const message = signedPortion.substring(81).match(/^(?:(?![9]{81}).)*(?=[9]*)/).shift();
    const nextKey = Crypto.converter.trytes(channelKey(Crypto.converter.trits(options.key), Crypto.converter.trits(salt)));
    return { message, root, nextRoot, nextKey }
}

module.exports = {
    create,
    messageID,
    messageHash,
    sign,
    //channelKey,
    parse
};

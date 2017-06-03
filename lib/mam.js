const Crypto = require('crypto.iota.js');
const MerkleTree = require('./merkle');
const crypto = require('crypto');

const HASH_LENGTH = 243;
const NULL_HASH_TRYTES = new Array(81).join('9');

function increment(subseed, count) {
  let index = count == null || count < 1 ? 1 : count;
  while(index-- > 0) {
    for (let j = 0; j < 243; j++) {

      if (++subseed[j] > 1) {

        subseed[j] = -1;
      } else {

        break;
      }
    }
  }
  return subseed;
}

function hash(...keys) {
  const curl = new Crypto.curl();
  const key = new Int32Array(Crypto.curl.HASH_LENGTH);
  curl.initialize();
  keys.map(k => curl.absorb(k, 0, k.length));
  curl.squeeze(key, 0, Crypto.curl.HASH_LENGTH);
  return key;
}

function tryteHash(...trytesSet) {
  const curl = new Crypto.curl();
  const hash = new Int32Array(HASH_LENGTH);
  curl.initialize();
  for(trytes in trytesSet) {
    curl.absorb(Crypto.converter.trits(trytes), 0, messageTrits.length);
  }
  curl.squeeze(hash, 0, hash.length);
  return Crypto.converter.trytes(hash);
}

function channelKey(seed, index) {
  const key = seed.slice();
  if(index == 0 || index == null) {
    hash(key);
  }
  while(index-- > 0) {
    increment(key);
    hash(key);
  }
  return key;
}

function trinarySum(a, b) {
  const result = a + b;
  return result == 2 ? -1 : result == -2 ? 1 : result;
}

const getTreeTrytes = function(tree) {
  return tree.reduce((a, b) => a + b.hash.toString(), ""); 
}
const getIndexTrytes = function(index) {
  const trits = Crypto.converter.fromValue(index);
  const trytes = Crypto.converter.trytes(trits.concat(new Array(Math.ceil(trits.length/3)*3 - trits.length).fill(0)));
  const length = Crypto.converter.fromValue(trytes.length);
  const lengthTryte = Crypto.converter.trytes(length.concat(new Array(Math.ceil(length.length/3)*3 - length.length).fill(0)));
  return lengthTryte + trytes;
}

const sign = function (options, bundle) {
  const privateKey = options.merkleTree.get(options.index % options.merkleTree.root.size());
  const message = options.nextRoot + options.message;
  const signature = Crypto.converter.trytes(((message, key, bundle) => {
    if(bundle == null) {
      bundle = new Crypto.bundle();
    }
    const normalizedHash = bundle.normalizedBundle(tryteHash(message)).slice(0,27);
    return Crypto.signing.signatureFragment(normalizedHash, key);

  })(message, privateKey.key.key, bundle));// sign(message, privateKey.key.key, bundle) );
  const index = getIndexTrytes(options.index);
  const tree = getTreeTrytes(privateKey.tree);
  return message + checksum + signature + index + tree;
}

const messageID = function (channelKey, salted) {
  const curl = new Crypto.curl();
  const channel = new Int32Array(Crypto.converter.trits(channelKey));
  hash(channel);
  hash(channel);
  return Crypto.converter.trytes(channel);
}

const getNextTrytes = function (payload, i) {
  const numLengthTrytes = Crypto.converter.value(Crypto.converter.trits(payload[i++]));
  const length = payload.substr(i, numLengthTrytes);
  return { 
    trytes: payload.substr(numLengthTrytes, 
      Crypto.converter.value(Crypto.converter.trits(length))), 
    length, 
    end: i+length+numLengthTrytes 
  };
}


const authenticate = function (options, payload, bundle) {
  const message = getNextTrytes(payload, 0);
  const nonce = getNextTrytes(payload, message.end);
  const signature = getNextTrytes(payload, nonce.end);
  const index = getNextTrytes(payload, singature.end);
  let hashes = getNextTrytes(payload, index.end).trytes.match(/.{81}/g);
  const nextRoot = message.substring(0,81);
  const messageHash = tryteHash(message.length, message, nonce);
  const normalizedHash = bundle.normalizedBundle(messageHash).slice(0, 27);
  const signingKey = Crypto.signing.address(Crypto.signing.digest(normalizedHash, Crypto.converter.trits(signature)))
  const root = Crypto.converter.trytes(MerkleTree.verify(signingKey, hashes.map(h => Crypto.converter.trits(h)), Crypto.converter.value( Crypto.converter.trits( index.trytes ))));
}

const unmask = function(payload, ...keys) {
  const curl = new Crypto.curl();
  curl.initialize();
  keys.forEach( key => curl.absorb(Crypto.converter.trits(key), 0, key.length*3));
  const plainTrits = new Int32Array(payload.length * 3);
  const intermedaiteKey = new Int32Array(Crypto.curl.HASH_LENGTH);
  return payload.match(/.{1,81}/g).map(m => {
    curl.squeeze(intermedaiteKey, 0, Crypto.curl.HASH_LENGTH);
    return Crypto.converter.trytes(Crypto.converter.trits(m).map((t,i) => trinarySum(t, -intermedaiteKey[i])));
  }).join('');
}

const mask = function(payload, ...keys) {
  const curl = new Crypto.curl();
  curl.initialize();
  keys.forEach( key => curl.absorb(Crypto.converter.trits(key), 0, key.length*3));
  const outTrits = new Int32Array(payload.length*3);
  const intermedaiteKey = new Int32Array(Crypto.curl.HASH_LENGTH);
  return payload.match(/.{1,81}/g).map(m => {
    curl.squeeze(intermedaiteKey, 0, Crypto.curl.HASH_LENGTH);
    return Crypto.converter.trytes(Crypto.converter.trits(m).map((t,i) => trinarySum(t, intermedaiteKey[i])));
  }).join('');
}

/**
 * [ message length length, message length, message, nonce length length, nonce length, nonce, signature, index length length, index length, index, hashes length length, hashes length, hashes, checksum ]
 * [ signature, sibling count, siblings, key index, message length, message, checksum length, checksum, ]
 */
const create = function (options) {
  const bundle = new Crypto.bundle();
  const message = sign(options, bundle);
  const cipher = mask(message, options.channelKey);

  const signatureFragments = cipher.match(/.{1,2187}/g);
  const address = messageID(options.channelKey);//Crypto.converter.trytes(channel);
  const value = 0;
  const tag = salt; 
  const timestamp = Math.floor(Date.now() / 1000);

  bundle.addEntry(signatureFragments.length, address, value, tag, timestamp);
  bundle.finalize();
  bundle.addTrytes(signatureFragments);

  const trytes = bundle.bundle.map((tx) => Crypto.transactionTrytes(tx)).reverse();
  const nextKey = Crypto.converter.trytes(channelKey(Crypto.converter.trits(options.channelKey), 1));
  return {trytes, nextKey};
}

const parse = function(options) {
  var bundle = new Crypto.bundle();
  const payload = unmask(options.cipher, options.key);
  const message = authenticate(options, payload, bundle);
  const nextKey = Crypto.converter.trytes(channelKey(Crypto.converter.trits(options.key), 1));
  return { message, root, nextRoot, nextKey }
}

module.exports = {
  mask,
  unmask,
  sign,
  authenticate,
  create,
  messageID,
  tryteHash,
  sign,
  channelKey,
  parse
};

var Crypto = require('crypto.iota.js');

function trinarySum(a, b) {
    const result = a + b;
    return result == 2 ? -1 : result == -2 ? 1 : result;
}

function increment(subseed) {
    for (let j = 0; j < 243; j++) {

        if (++subseed[j] > 1) {

            subseed[j] = -1;
        } else {

            break;
        }
    }
    return subseed;
}

function hash(key, curl) {
    if(curl == null) {
        curl = new Crypto.curl();
    }
    curl.initialize();
    curl.absorb(key, 0, key.length);
    curl.squeeze(key, 0, key.length);
    return key;
}

function subseed(seed, index) {
    const key = seed.slice();
    let i = index;
    const curl = new Crypto.curl();
    curl.initialize();
    while(i-- > 0) {
        increment(key);
        hash(key, curl);
    }
    return key;
}

function key(seed, length) {

    const next_subseed = Crypto.converter.trits(seed);
    const key = new Int32Array(length);
    const curl = new Crypto.curl();

    curl.initialize();
    curl.absorb(next_subseed, 0, Crypto.curl.HASH_LENGTH);
    curl.squeeze(key, 0, length);

    return Crypto.converter.trytes(key);
}

function encrypt(message, key) {
    const keyTrits = Crypto.converter.trits(key);
    const messageTrits = Crypto.converter.trits(message);
    const cipher = messageTrits.map((v, i) => {
      return trinarySum(v, keyTrits[i]);
    });
    return Crypto.converter.trytes(cipher);
}

function decrypt(message, key) {
    const keyTrits = Crypto.converter.trits(key);
    const messageTrits = Crypto.converter.trits(message);
    const plain = messageTrits.map((v, i) => {
      return trinarySum(v, -keyTrits[i]);
    });
    return Crypto.converter.trytes(plain);
};

module.exports = {
    encrypt,
    decrypt,
    increment,
    subseed,
    hash,
    key,
};

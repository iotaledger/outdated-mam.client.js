var Crypto = require('crypto.iota.js');

var trinarySum = function (a, b) {
    var result = a + b;
    return result == 2 ? -1 : result == -2 ? 1 : result;
}

var key = function (seed, length) {

    var subseed = Crypto.converter.trits(seed);
    var key = new Int32Array(length);

    var curl = new Crypto.curl();
    curl.initialize();
    curl.absorb(subseed, 0, subseed.length);
    curl.squeeze(key, 0, length);

    /*
    while (length > 0) {
        curl.squeeze(buffer);
        for (var j = 0; j < 243 && length-- > 0; j++) {
            key[offset++] = buffer[j];
        }
    }
    */
    return Crypto.converter.trytes(key);
}

var encrypt = function (message, key) {
    var keyTrits = Crypto.converter.trits(key);
    var messageTrits = Crypto.converter.trits(message);
    var cipher = messageTrits.map(function (v, i) { return trinarySum(v, keyTrits[i]) });
    return Crypto.converter.trytes(cipher);
}

var decrypt = function (message, key) {
    var keyTrits = Crypto.converter.trits(key);
    var messageTrits = Crypto.converter.trits(message);
    var plain = messageTrits.map(function (v, i) { return trinarySum(v, -keyTrits[i]) });
    return Crypto.converter.trytes(plain);
};
module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    key: key
};
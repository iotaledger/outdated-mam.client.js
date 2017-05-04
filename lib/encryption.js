var Crypto = require('crypto.iota.js');

var trinarySum = function (a, b) {
    var result = a + b;
    return result == 2 ? -1 : result == -2 ? 1 : result;
}

var increment = function(subseed) {
    for (var j = 0; j < 243; j++) {

        if (++subseed[j] > 1) {

            subseed[j] = -1;
        } else {

            break;
        }
    }
}

var subseed = function(seed, index) {
    var subseed = seed.slice();
    for (var i = 0; i < index; i++) {
        increment(subseed);
    }
    return subseed;
}

var key = function (seed, seedIndex, keyIndex, length) {

    var next_subseed = subseed(Crypto.converter.trits(seed), seedIndex);

    var key = new Int32Array(length);
    var curl = new Crypto.curl();
    curl.initialize();
    curl.absorb(next_subseed, 0, next_subseed.length);
    curl.squeeze(key, 0, length);
    for(var i = keyIndex; i-- > 0;) {
        increment(key);
        curl.initialize();
        curl.absorb(key, 0, key.length);
        curl.squeeze(key, 0, length);
    }

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
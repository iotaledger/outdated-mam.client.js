var Converter = require('../tempcrypt/converter');
var Curl = require('../tempcrypt/curl');
var Signing = require('../tempcrypt/signing');

var trinarySum = function (a, b) {
    var result = a + b;
    return result == 2 ? -1 : result == -2 ? 1 : result;
}

var key = function (seed, length) {

    var subseed = Converter.trits(seed);

    var curl = new Curl();
    curl.initialize();
    curl.absorb(subseed);

    var key = [], offset = 0, buffer = [];

    while (length > 0) {
        curl.squeeze(buffer);
        for (var j = 0; j < 243 && length-- > 0; j++) {
            key[offset++] = buffer[j];
        }
    }
    return Converter.trytes(key);
}

var encrypt = function (message, key) {
    var keyTrits = Converter.trits(key);
    var messageTrits = Converter.trits(message);
    var cipher = messageTrits.map(function (v, i) { return trinarySum(v, keyTrits[i]) });
    return Converter.trytes(cipher);
}

var decrypt = function (message, key) {
    var keyTrits = Converter.trits(key);
    var messageTrits = Converter.trits(message);
    var plain = messageTrits.map(function (v, i) { return trinarySum(v, -keyTrits[i]) });
    return Converter.trytes(plain);
};
module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    key: key
};
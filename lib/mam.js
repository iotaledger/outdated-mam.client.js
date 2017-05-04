var Crypto = require('./encryption');
var Curl = require('../tempcrypt/curl');
var Converter = require('../tempcrypt/converter');
var Signing = require('../tempcrypt/signing');
var Bundle = require('../tempcrypt/bundle');
var AsciiTrytes = require('../tempcrypt/asciiToTrytes');

var HASH_LENGTH = 243;
var NULL_HASH_TRYTES = new Array(81).fill('9').join('');

function buffer(array, value, size) {
    var remaining = array.length % size;
    var copy = array.slice();
    for(var i = 0; i < remaining; i++) {
        copy.concat(value);
    }
    return copy;
}

function bufferLength(length) {
    return 2187 - ( length - Math.floor(length/2187)*2187 )
}

var MaskedAuthenticatedMessage = function(options) {
    function MessageTransaction(address, message, tag) {
        return {
            address: address,
            value: 0,
            message: message,
            tag: tag
        };
    }

    var treeSize = options.merkleTree.root.size()
    var keyIndex = options.index % treeSize;
    var key = options.merkleTree.get(keyIndex);

    var tree = key.tree.reduce(function(a, b) { 
        var h = b.hash.value;
        var c = a.concat(h);
        return c;
    }, []);

    tree = Converter.trytes(tree).concat(Array(81).fill('9').join(''));

    var messageTrytes = AsciiTrytes.toTrytes(options.message);
    if(keyIndex == treeSize - 1) {
        messageTrytes.concat(options.nextRoot);
    }
    messageTrytes.concat(options.nextChannelKey);
    var treeTrytes = key.tree.toString().concat(NULL_HASH_TRYTES);
    var treelen = treeTrytes.length;
    messageTrytes = messageTrytes.concat(new Array(bufferLength(messageTrytes.length + tree.length)).fill('9').join(''));

    var encryptionkey = Crypto.key(options.channelKey, messageTrytes.length*3);
    var cipher = Crypto.encrypt(messageTrytes, encryptionkey);
    var hash = new Int32Array(HASH_LENGTH);
    var channel = new Int32Array(HASH_LENGTH);

    var tag = Converter.trytes(Converter.fromValue(options.index));
    var transfers = [];
    var curl = new Curl();
    curl.initialize();
    curl.absorb(Converter.trits(options.channelKey));
    curl.squeeze(channel);
    curl.absorb(channel);
    curl.squeeze(channel);

    curl.initialize();
    curl.absorb(cipher);
    curl.squeeze(hash);

    var signature = Signing.signatureFragment(new Bundle().normalizedBundle(Converter.trytes(hash))[0], Converter.trytes(key.key.key));
    var l = signature.length;

    transfers.push(new MessageTransaction(Converter.trytes(channel), signature.concat(tree).concat(cipher), tag));

    return transfers;
}

module.exports = {
    MaskedAuthenticatedMessage
};
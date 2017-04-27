var Converter = require('../crypto/converter');
var Signing = require('../crypto/signing');
var Crypto = require('../crypto/encryption');
var Bundle = require('../crypto/bundle');
var AsciiTrytes = require('../utils/asciiToTrytes');

var HASH_LENGTH = 243;

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

var MaskedAuthenticatedMessage = function(message, merkleTree, nextRoot, seed, index, curl) {
    function MessageTransaction(address, message, tag) {
        return {
            address: address,
            value: 0,
            message: message,
            tag: tag
        };
    }
    var treeSize = merkleTree.root.size()
    var keyIndex = index % treeSize;
    var key = merkleTree.get(keyIndex);
    if(keyIndex == treeSize - 1) {
        message.concat(nextRoot);
    }
    var messageTrytes = AsciiTrytes.toTrytes(message);
    messageTrytes = messageTrytes.concat(new Array(bufferLength(messageTrytes.length)).fill('9').join(''));
    var encryptionkey = Crypto.key(seed, messageTrytes.length*3);
    var cipher = Crypto.encrypt(messageTrytes, encryptionkey);
    var hash = new Int32Array(HASH_LENGTH);
    var channel = new Int32Array(HASH_LENGTH);
    var encryptionkey = Crypto.key(seed, messageTrytes.length*3);
    var cipher = Crypto.encrypt(messageTrytes, encryptionkey);
    var hash = new Int32Array(HASH_LENGTH);
    var channel = new Int32Array(HASH_LENGTH);
    var tag = Converter.trytes(Converter.fromValue(index));
    var transfers = [];
    var tree = key.tree.reduce(function(a, b) { 
        var h = b.hash.value;
        var c = a.concat(h);
        return c;
    }, []);
    tree = Converter.trytes(tree).concat(Array(81).fill('9').join(''));

    curl.initialize();
    curl.absorb(Converter.trits(seed));
    curl.squeeze(channel);

    curl.initialize();
    curl.absorb(cipher);
    curl.squeeze(hash);

    var bundle = new Bundle();
    var signature = Signing.signatureFragment(bundle.normalizedBundle(Converter.trytes(hash))[0], Converter.trytes(key.key.key));
    var l = signature.length;
    transfers.push(new MessageTransaction(Converter.trytes(channel), signature.concat(tree).concat(cipher), tag));

    return transfers;
}

module.exports = {
    MaskedAuthenticatedMessage
};
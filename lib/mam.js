var Crypto = require('crypto.iota.js');
var Encryption = require('./encryption');

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

    tree = Crypto.converter.trytes(tree).concat(Array(81).fill('9').join(''));

    var messageTrytes = options.message.slice();
    if(keyIndex == treeSize - 1) {
        messageTrytes = messageTrytes.concat(options.nextRoot);
    }
    messageTrytes = messageTrytes.concat(options.nextChannelKey);
    var treeTrytes = key.tree.toString().concat(NULL_HASH_TRYTES);
    var treelen = treeTrytes.length;
    messageTrytes = messageTrytes.concat(new Array(bufferLength(messageTrytes.length + tree.length)).fill('9').join(''));

    var encryptionkey = Encryption.key(options.channelKey, messageTrytes.length*3);
    var cipher = Encryption.encrypt(messageTrytes, encryptionkey);
    var hash = new Int32Array(HASH_LENGTH);
    var channel = new Int32Array(HASH_LENGTH);

    var tag = Crypto.converter.trytes(Crypto.converter.fromValue(options.index));
    var transfers = [];
    var curl = new Crypto.curl();
    var channelTrits = Crypto.converter.trits(options.channelKey);
    curl.initialize();
    curl.absorb(channelTrits, 0, channelTrits.length);
    curl.squeeze(channel, 0, channel.length);
    curl.absorb(channel, 0, channel.length);
    curl.squeeze(channel, 0, channel.length);

    curl.initialize();
    curl.absorb(cipher, 0, cipher.length);
    curl.squeeze(hash, 0, hash.length);

    var signature = Crypto.signing.signatureFragment(new Crypto.bundle().normalizedCrypto.bundle(Crypto.converter.trytes(hash))[0], Crypto.converter.trytes(key.key.key));
    var l = signature.length;

    transfers.push(new MessageTransaction(Crypto.converter.trytes(channel), signature.concat(tree).concat(cipher), tag));

    return transfers;
}

module.exports = {
    MaskedAuthenticatedMessage
};
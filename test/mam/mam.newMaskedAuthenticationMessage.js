
var chai = require('chai');
var assert = chai.assert;
var MAM = require('../../lib/mam');
var MerkleTree = require('../../lib/merkle');
var Crypto = require('crypto.iota.js');

describe('new.MAM', function() {

    var tests = [
        // Valid bundle
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            encryptionSeed: "9XRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            message: "HELLOWORLDIAMATRYTE9ENCODEDSTRINGMADEBYIOTALIB9JSUTILASCIITOTRYTES",
            encryptionKeyIndex: 1,
            channelKeyIndex: 1,
            start: 3,
            count: 4,
            security: 1,
        },
    ]

    tests.forEach(function(test) {

        it('should create a signed, encrypted message with merkle tree on channel' + test.seed + ' with ', function() {
            var tree0 = new MerkleTree(test.seed, test.start, test.count, test.security);
            var tree1 = new MerkleTree(test.seed, test.start + test.count, test.count, test.security);
            var index;
            for(index = 1; index < tree0.root.size(); index++) {
                var mamTransactions = new MAM.create({
                    message: test.message,
                    merkleTree: tree0,
                    nextRoot: tree1.root.hash.toString(),
                    channelKey: test.encryptionSeed,
                    channelKeyIndex: test.channelKeyIndex,
                    encryptionKeyIndex: test.encryptionKeyIndex,
                    index: index
                });
                assert.notEqual(mamTransactions.length, 0);
            }
        });

    })
});

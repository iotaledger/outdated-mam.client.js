
var chai = require('chai');
var assert = chai.assert;
var MAM = require('../../lib/mam');
var MerkleTree = require('../../lib/crypto/merkle');
var Curl = require('../../lib/crypto/curl');
var Converter = require('../../lib/crypto/converter');

describe('MerkleTree.get', function() {

    var tests = [
        // Valid bundle
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            encryptionSeed: "9XRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            message: "Hello, World! I have the best messages, that no one else has as good as me! Test one two threee four five six seven",
            start: 3,
            count: 9,
            security: 1,
        },
    ]

    tests.forEach(function(test) {

        it('should create a signed, encrypted message with merkle tree on channel' + test.seed + ' with ', function() {
            var tree0 = new MerkleTree(test.seed, test.start, test.count, test.security);
            var tree1 = new MerkleTree(test.seed, test.start + test.count, test.count, test.security);
            var index;
            for(index = 0; index < tree0.root.size(); index++) {
                var mamTransactions = new MAM.MaskedAuthenticatedMessage(test.message, tree0, tree1.root.hash.toString(), test.encryptionSeed, index, new Curl());
                var length = mamTransactions[1].message.length;
            }
        });

    })
});
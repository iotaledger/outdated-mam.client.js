var chai = require('chai');
var assert = chai.assert;
var MAM = require('../../lib/mam');
var MerkleTree = require('../../lib/merkle');
var Crypto = require('crypto.iota.js');
var Converter = Crypto.converter;

describe('MerkleTree.get', function () {

    var tests = [
        // Valid bundle
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            start: 3,
            count: 9,
            security: 1,
        },
    ]

    tests.forEach(function (test) {

        it('should return a key and its relative merkle hashes: ' + test.seed + ' with ', function () {
            var tree, chosenKey, index;
            tree = new MerkleTree(test.seed, test.start, test.count, test.security);
            index = 0;
            var rootTrytes = tree.root.hash.toString();
            assert.equal(test.count, tree.root.size());
            const thingToSign = "ABCDEFGHIJK";
            const bundle = new Crypto.bundle();
            for (index = 0; index < test.count; index++) {
                chosenKey = tree.get(index);
                const normalizedHash = bundle.normalizedBundle(MAM.messageHash(thingToSign)).slice(0,27);
                const signature = Crypto.signing.signatureFragment(normalizedHash, chosenKey.key.key);
                var calculatedRoot = Crypto.converter.trytes(MerkleTree.verify(Crypto.signing.address(Crypto.signing.digest(normalizedHash, signature)),
                    chosenKey.tree.map(k => k.hash.value),// .toString().match(/.{81}/g),
                    index));
                assert.equal(rootTrytes, calculatedRoot);
            }
        });

    })
});
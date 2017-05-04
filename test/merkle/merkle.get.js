
var chai = require('chai');
var assert = chai.assert;
var MerkleTree = require('../../lib/merkle');
var Crypto = require('crypto.iota.js');

describe('MerkleTree.get', function() {

    var tests = [
        // Valid bundle
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            start: 3,
            count: 9,
            security: 1,
        },
    ]

    tests.forEach(function(test) {

        it('should return a key and its relative merkle hashes: ' + test.seed + ' with ', function() {
            var tree, first, index;
            tree = new MerkleTree(test.seed, test.start, test.count, test.security);
            index = 0;
            for(index = 0; index < test.count; index++) {
                first = tree.get(index);
                assert.equal(tree.root.hash.toString(), 
                Crypto.converter.trytes(
                    MerkleTree.verify(new Int32Array(first.key.hash.value), first.tree, index) ));
            }
        });

    })
});
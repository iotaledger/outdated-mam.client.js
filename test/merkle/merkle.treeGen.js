var chai = require('chai');
var assert = chai.assert;
var MerkleTree = require('../../lib/merkle');

describe('new.MerkleTree', function() {

    var tests = [
        // Valid bundle
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            start: 3,
            count: 9,
            security: 1,
            expected: "FPYBTCXTXJRTTUGXWWXKZRLMYXUPYTEJWHJODPQAAEAFBESDMV9EWZZZIZULEJDJMEW9XIQTGHNXNPVBL",
        },
    ]

    tests.forEach(function(test) {

        it('should create a new merkle tree from seed: ' + test.seed + ' with ', function() {

            var tree = new MerkleTree(test.seed, test.start, test.count, test.security);
            assert.isNotNull(tree.root.hash);
            assert.equal(test.expected, tree.root.hash.toString())
        });

    })
});

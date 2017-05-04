var chai = require('chai');
var assert = chai.assert;
var Encryption = require('../../lib/encryption');
var Crypto = require('crypto.iota.js');

describe('encryption.key', function() {

    var tests = [
        { 
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            length: 993,
            expected: "NGAZRRBUKTEJLNOQEZJZIRMY9DAVNZBOHCMELEOEFCGSJEIKDWETOMDOOQDBQILEJLD9MVXZZXZQGNHRKVLZPOMKOQRIQCGWYXSHPZKMXLJZCXBILCJITRDGNTVBWZOUXBASIKKLVB9VSEWQMBBPH9BETMURVOCEXCAQPOVZYOOBQWUQIQICQLXPI9SNNXO9TWPJAF9PLNWQNADJUGIQRWHPNMJLTFMSQLHGCWHVIATRCQLGPHFCWUGXYKMUDHULOQXCPOIEWNDRMAJVMLADYWGHNNJOVG9PMY9HYYQOLPD9UEHRXKKIHKZSFHOPXGHCZLA9ZNLXASJ"
        },
    ]

    tests.forEach(function(test) {

        it('should create key from: ' + test.seed + ' of length ' + test.length + ' equal to ' + test.expected, function() {

            var key = Encryption.key(test.seed, test.length);
            assert.deepEqual(key, test.expected);
        });
    })
});

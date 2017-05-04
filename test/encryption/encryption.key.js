var chai = require('chai');
var assert = chai.assert;
var Encryption = require('../../lib/encryption');
var Crypto = require('crypto.iota.js');

describe('encryption.key', function() {

    var tests = [
        { 
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            length: 993,
            expected: "VLZPOMKOQRIQCGWYXSHPZKMXLJZCXBILCJITRDGNTVBWZOUXBASIKKLVB9VSEWQMBBPH9BETMURVOCEXCAQPOVZYOOBQWUQIQICQLXPI9SNNXO9TWPJAF9PLNWQNADJUGIQRWHPNMJLTFMSQLHGCWHVIATRCQLGPHFCWUGXYKMUDHULOQXCPOIEWNDRMAJVMLADYWGHNNJOVG9PMY9HYYQOLPD9UEHRXKKIHKZSFHOPXGHCZLA9ZNLXASJWWXYBWYQOAPXWU9GNTASTWTXXGRFUE9XXFEV9ODGNJNZKMSCQJCCMEPZWMYS9KSZRRWVCHSQTBCLGKSLK"
        },
    ]

    tests.forEach(function(test) {

        it('should create key from: ' + test.seed + ' of length ' + test.length + ' equal to ' + test.expected, function() {

            var key = Encryption.key(test.seed, test.length);
            var curl = new Crypto.curl();
            var buffer = [];
            var seed = Crypto.converter.trits(test.seed);
            curl.initialize();
            curl.absorb(seed);
            curl.squeeze(buffer);
            buffer = Crypto.converter.trytes(buffer);

            assert.deepEqual(key, test.expected);
        });
    })
});

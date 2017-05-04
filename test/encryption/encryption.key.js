var chai = require('chai');
var assert = chai.assert;
var Encryption = require('../../lib/encryption');
var Crypto = require('crypto.iota.js');

describe('encryption.key', function() {

    var tests = [
        { 
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            length: 993,
            expected: "MWVERVB9CKSCEOMIHGILHG9PYXHUZJGBFBDIUDXCKCGAL9ORCFHXJAXDHKWYQGSMVDGTZHCTXXCLRYPGNLBAGE9PJETNWSIOLTCYOOKFKMMH9QOZXBKKUFMMIUDXBWWKAUQUO9PFPBAUYXQIQVTVEKMYULXF9AGMELRHF9UKNKVKTLCVFIRLGFZXDIETSKPPUZSAQUCQWAYIDLOHTLTAGBRETKMIIHLQOZXPYVCWNJSO9JFDQDWZSSEIDHXYAXCRDWICUUWUORDLQPFVGZUQLO9FWMTONVOUUINANGRCIEHEQMCAKL9TCFDFPYVUPGMLIPLSOKOHZDZ"
        },
    ]

    tests.forEach(function(test) {

        it('should create key from: ' + test.seed + ' of length ' + test.length + ' equal to ' + test.expected, function() {

            var key = Encryption.key(test.seed, 1, 1, test.length);
            assert.deepEqual(key, test.expected);
        });
    })
});

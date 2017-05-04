var chai = require('chai');
var assert = chai.assert;
var Encryption = require('../../lib/encryption');

describe('encryption.encrypt', function() {

    var tests = [
        { 
            cipher: "BQTX",
            key: "DASR",
            expected: "ASDF",
        },
    ]

    tests.forEach(function(test) {

        it('should create cipher from: ' + test.cipher + ' with key ' + test.key + ' that equals: ' + test.expected, function() {

            var plain = Encryption.decrypt(test.cipher, test.key);

            assert.equal(plain, test.expected);
        });
    })
});

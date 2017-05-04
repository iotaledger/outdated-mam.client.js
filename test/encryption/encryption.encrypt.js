var chai = require('chai');
var assert = chai.assert;
var Encryption = require('../../lib/encryption');

describe('encryption.encrypt', function() {

    var tests = [
        { 
            message: "ASDF",
            key: "DASR",
            expected: "BQTX"
        },
    ]

    tests.forEach(function(test) {

        it('should create cipher from: ' + test.message + ' with key ' + test.key + ' that equals: ' + test.expected, function() {

            var cipher = Encryption.encrypt(test.message, test.key);

            assert.equal(cipher, test.expected);
        });
    })
});

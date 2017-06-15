var chai = require('chai');
var assert = chai.assert;
var trytes = require('../../lib/trytes');

describe.only('Trytes.encodePascalsTrytes', function () {

    var tests = [
        // Valid bundle
        {
            trytes: '',
            pascal: 'A9'
        },
        {
            trytes: 'ABCDEF',
            pascal: 'AFABCDEF'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXY',
            pascal: 'BZA9ABCDEFGHIJKLMNOPQRSTUVWXY'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            pascal: 'B9A9ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        }
    ]

    tests.forEach(function (test) {

        it('should return a valid pascal tryte version of a tryte string: \'' + test.trytes + '\' with \'' + test.pascal + '\'', function () {
            var result = trytes.encodePascalsTrytes(test.trytes);
            assert.equal(test.pascal, result);
        });
    });
});

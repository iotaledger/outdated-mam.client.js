var chai = require('chai');
var assert = chai.assert;
var trytes = require('../../lib/trytes');

describe('Trytes.decodePascalsTrytes', function () {

    var tests = [
        // Valid bundle
        {
            trytes: '',
            pascal: 'A9'
        },
        {
            trytes: '',
            pascal: 'A999999'
        },
        {
            trytes: 'ABCDEF',
            pascal: 'AFABCDEF99999'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXY',
            pascal: 'BZA9ABCDEFGHIJKLMNOPQRSTUVWXY999999'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            pascal: 'B9A9ABCDEFGHIJKLMNOPQRSTUVWXYZ9999'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            pascal: 'B9A9ABCDEFGHIJKLMNOPQRSTUVWXYZ9999'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXY',
            pascal: 'B9A9ABCDEFGHIJKLMNOPQRSTUVWXY'
        }
    ]

    tests.forEach(function (test) {

        it('should return a tryte version of a pascal tryte string: \'' + test.pascal + '\' with \'' + test.trytes + '\'', function () {
            var result = trytes.decodePascalsTrytes(test.pascal);
            assert.equal(test.trytes, result);
        });
    });
});

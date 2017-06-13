var chai = require('chai');
var assert = chai.assert;
var trytes = require('../../lib/trytes');

describe.only('Trytes.pascalsTrytes', function () {

    var tests = [
        // Valid bundle
        {
            trytes: 'ABCDEF',
            pascal: 'AFABCDEF'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXY',
            pascal: 'AZ9ABCDEFGHIJKLMNOPQRSTUVWXY'
        },
        {
            trytes: '9ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            pascal: 'BA99ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        }
    ]

    tests.forEach(function (test) {

        it('should return a valid pascal tryte version of a tryte string: ' + test.trytes + ' with ' + test.pascal, function () {
            var result = trytes.pascalsTrytes(test.trytes);
            assert.equal(test.pascal, result);
        });
    });
});

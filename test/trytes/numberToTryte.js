var chai = require('chai');
var assert = chai.assert;
var trytes = require('../../lib/trytes');

describe('Trytes.numberToTryte', function () {

    var tests = [
        // Valid bundle
        {
            number: -1,
            tryte: null
        },
        {
            number: 0,
            tryte: '9'
        },
        {
            number: 1,
            tryte: 'A'
        },
        {
            number: 26,
            tryte: 'Z'
        },
        {
            number: 27,
            tryte: 'A9'
        },
        {
            number: 28,
            tryte: 'AA'
        },
        {
            number: 728,
            tryte: 'ZZ'
        },
        {
            number: 729,
            tryte: 'A99'
        }
    ]

    tests.forEach(function (test) {

        it('should return a valid tryte encoded number: ' + test.number + ' with ' + test.pascal, function () {
            var result = trytes.numberToTryte(test.number);
            assert.equal(test.tryte, result);
        });
    });
});

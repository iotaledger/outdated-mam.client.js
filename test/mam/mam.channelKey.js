var chai = require('chai');
var assert = chai.assert;
var MAM = require('../../lib/mam');
var Crypto = require('crypto.iota.js');

describe('MAM.channelKey', function() {

    var tests = [
        {
            seed: "KXRVLFETGUTUWBCNCC9DWO99JQTEI9YXVOZHWELSYP9SG9KN9WCKXOVTEFHFH9EFZJKFYCZKQPPBXYSGJ",
            length: 993,
        },
    ]

    tests.forEach(function(test) {

        it('should create key from: ' + test.seed + ' of length ' + test.length + ' equal to ' + test.expected, function() {
            var key = MAM.channelKey(Crypto.converter.trits(test.seed), 1);
            var key1 = MAM.channelKey(key, 1);
            var key2 = MAM.channelKey(key1, 1);
            assert.notDeepEqual(key1, key2);
        });
    })
});

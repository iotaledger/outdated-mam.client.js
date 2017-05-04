var Crypto = require('crypto.iota.js');

var HASH_LENGTH = 243;

function Hash(trits) {
    this.value = trits;
    this.toString = function () { return Crypto.converter.trytes(this.value) }
    this.trytes = this.toString();
}

function Key(seed, index, security) {
    var key = Crypto.signing.key(seed, index, security);
    var digests = Crypto.signing.digests(key);
    var address = Crypto.signing.address(digests);
    //var address = Crypto.converter.trytes(addressTrits);
    this.key = key;
    this.hash = new Hash(address);
    this.size = function () { return 1 };
    this.get = function () { return this };
}

function combineHashes(first, second, curl) {
    var subroot = new Array(HASH_LENGTH);
    curl.initialize();
    curl.absorb(first.value);
    curl.absorb(second.value);
    curl.squeeze(subroot);
    return new Hash(subroot);
}

var MerkleNode = function (left, right, curl) {
    this.left = left;
    this.right = right == null ? left : right;
    this.hash = combineHashes(this.left.hash, this.right.hash, curl);
    this.size = function () {
        return this.left.size() + (this.right == this.left ? 0 : this.right.size());
    }
};
var computeMerkleTree = function (nodes, curl) {
    var subnodes = [];
    while (nodes.length != 0) {
        subnodes.push(new MerkleNode(nodes.shift(), nodes.shift(), curl));
    }
    if (subnodes.length == 1) {
        return subnodes[0];
    }
    return computeMerkleTree(subnodes, curl);
}
var MerkleTree = function (seed, start, count, security) {
    var seedTrits = Crypto.converter.trits(seed);
    var keys = [];
    var end = start + count;
    for (i = start; i < end; i++) {
        keys.push(new Key(seedTrits, i, security));
    }
    this.root = computeMerkleTree(keys, new Crypto.curl());
    this.get = function (index) {
        var tree = [];
        var node = this.root;
        var key = null;
        var size = node.size();
        if (index < size) {
            while (node != null) {
                if (node.left == undefined) {
                    key = node;
                    break;
                }
                size = node.left.size()
                if (index < size) {
                    if (node.right != null) {
                        tree.unshift(node.right);
                    }
                    node = node.left;
                } else {
                    tree.unshift(node.left);
                    node = node.right;
                    index -= size;
                }
            }
        }
        tree.toString = function() {
            return tree.reduce(function(a,b) {
                return a.concat(b.hash.toString());
            }, "");
        }
        return {
            key: key,
            tree: tree
        };
    }
};
MerkleTree.verify = function(input, tree, index, curl) {
    if(curl == null) {
        curl = new Crypto.curl();
    }
    var indexCopy = index;
    var hash = input.slice();
    tree.forEach(function(v, i) {
        curl.initialize();
        var h = Crypto.converter.trytes(v.hash.value)
        var j = Crypto.converter.trytes(hash)
        if(indexCopy & 1) {
            curl.absorb(v.hash.value);
            curl.absorb(hash);
        } else {
            curl.absorb(hash);
            curl.absorb(v.hash.value);
        }
        indexCopy >>= 1;
        curl.squeeze(hash);
    });
    return hash;
}

module.exports = MerkleTree;
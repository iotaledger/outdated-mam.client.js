const Crypto = require('iota.crypto.js');
const Converter = Crypto.converter;

const HASH_LENGTH = 243;

function Hash(trits) {
    this.value = trits;
    this.toString = () => {
      return Crypto.converter.trytes(this.value);
    }
}

function Key(seed, index, security) {
    const key = Crypto.signing.key(seed, index, security);
    const digests = Crypto.signing.digests(key);
    const address = Crypto.signing.address(digests);
    //var address = Crypto.converter.trytes(addressTrits);
    this.key = key;
    this.hash = new Hash(address);
    this.size = () => 1;
    this.get = () => this;
}

function combineHashes(first, second, curl) {
    const subroot = new Array(HASH_LENGTH);
    curl.initialize();
    curl.absorb(first.value, 0, HASH_LENGTH);
    curl.absorb(second.value, 0, HASH_LENGTH);
    curl.squeeze(subroot, 0, HASH_LENGTH);
    return new Hash(subroot);
}

function MerkleNode(left, right, curl) {
    this.hash = combineHashes(left.hash, right == null? left.hash: right.hash, curl);
    this.left = left;
    if(right) {
        this.right = right;
    }
    this.size = () => {
        return this.left.size() + (this.right == undefined ? 0 : this.right.size());
    }
};

function computeMerkleTree(nodes, curl) {
    const subnodes = [];
    while (nodes.length != 0) {
        subnodes.push(new MerkleNode(nodes.shift(), nodes.shift(), curl));
    }
    if (subnodes.length == 1) {
        return subnodes[0];
    }
    return computeMerkleTree(subnodes, curl);
}
function MerkleTree(seed, start, count, security) {
    const seedTrits = Crypto.converter.trits(seed);
    const keys = [];
    const end = start + count;
    for (let i = start; i < end; i++) {
        keys.push(new Key(seedTrits, i, security));
    }
    this.root = computeMerkleTree(keys, new Crypto.curl());
    this.get = function (index) {
        const tree = [];
        let node = this.root;
        let key = null;
        let size = node.size();
        if (index < size) {
            while (node != null) {
                if (node.left == null) {
                    key = node;
                    break;
                }
                size = node.left.size()
                if (index < size) {
                    if (node.right != null) {
                        tree.unshift(node.right);
                    } else {
                        tree.unshift(node.left);
                    }
                    node = node.left;
                } else {
                    tree.unshift(node.left);
                    node = node.right;
                    index -= size;
                }
            }
        }
        tree.toString = () => {
            return tree.reduce((a,b) => {
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
    let indexCopy = index;
    const hash = new Int32Array(input);
    tree.forEach(function(v, i) {
        curl.initialize();
        if(indexCopy & 1) {
            curl.absorb(v, 0, HASH_LENGTH);
            curl.absorb(hash, 0, HASH_LENGTH);
        } else {
            curl.absorb(hash, 0, HASH_LENGTH);
            curl.absorb(v, 0, HASH_LENGTH);
        }
        indexCopy >>= 1;
        curl.squeeze(hash, 0, HASH_LENGTH);
    });
    return hash;
}

module.exports = MerkleTree;

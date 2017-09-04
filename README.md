# Notice of Deprecation

Development on this repository will not continue; further development can be found on (in-progress) github.com/iotaledger/MAM

# MAM Client Javascript Library

This is the official Javascript library for MAM(Masked Authenticated Messaging).

## Masked Authenticated Messages

It is possible to publish transactions to the Tangle that contain only messages, with no value. This introduces many possibilities for data integrity and communication, but comes with the caveat that message-only signatures are not checked. What we introduce is a method of symmetric-key encrypted, signed data that takes advantage of merkle-tree winternitz signatures for extended public key usability, that can be found trivially by those who know to look for it.

For more details, take a look at the [Overview](../master/Overview.md).

## Notice
It should be noted that the Javascript MAM Client is an **early beta release**. There is no assurance that unexpected issues will not occur. Please join the community and post [issues on here](https://github.com/iotaledger/mam.client.js/issues).


> **Join the Discussion**

> If you want to get involved in the community, need help with getting setup, have any issues related with the library or just want to discuss Blockchain, Distributed Ledgers and IoT with other people, feel free to join our  [Slack](http://slack.iotatoken.com/). You can also ask questions on our dedicated forum at: [IOTA Forum](http://forum.iotatoken.com/).

## Installation

Use [npm](https://npmjs.com) to install:
```
npm install mam.client.js
```

---

## Usage

### Creating Merkle Trees

```Javascript
const seed = 'XXMPUFDZTAWNORLGZT9SZXHXXMSINBQVPCJITKOGIIPPUCARZEATSCUBMRXXQTXYRUTXUCBEV9YUMIFJB';
const start = 3;
const count = 4;
const security = 2;

const tree0 = new MerkleTree(seed, start, count, security);
const tree1 = new MerkleTree(seed, start + count, count, security);
```

### Creating a Masked Authenticated Message

```Javascript
const mam = MAM.create({
  message: 'WCTC9D9DCDFAEADBNA',
  merkleTree: tree0,
  index: index,
  nextRoot: tree1.root.hash.toString(),
  channelKey: 'EJTKEICAUGQFUHZNTYMVUDJLFYQAMYUZOJSCDBTXE9CMZGYUVFIHGDVHCLHJCEGDZGXJKJZKQADZBSFEL'
});

// Prints an array of trytes
console.log(mam);
```

### Parsing Masked Authenticated Messages

Use `MAM.parse` to get a parsed object of a MAM containing the `root`, `signingKey`, `nextRoot` & `message`

```Javascript

const parsed = MAM.parse({key: channelKey, message: message, tag: tag});

// Prints an object of the parsed MAM
console.log(parsed);
```
---

## MAM

### `MAM.create`

Creates the trytes of a Masked Authenticated Message for the given `options`.

#### Input
```Javascript
MAM.create(options)
```
**`options`**: `Object`
 - **`message`**: `String` Tryte-encoded plain text  
 - **`merkleTree`**: `Object` Merkle tree
 - **`index`**: `Int` Index of the merkle tree leaf key
 - **`nextRoot`**: `String` Root of the next merkle tree
 - **`channelKey`**: `String` Channel key

#### Return Value

**`Object`**
 - **`trytes`**: `Array` an array of trytes
 - **`nextKey`**: `String` Tryte-encoded key for the following message

---

### `MAM.parse`

Parses a Masked Authenticated Message.

#### Input
```Javascript
MAM.parse(options)
```
1. **`options`**: `Object`
 - **`key`**: `String` Channel key
 - **`message`**: `Array` Array of trytes
 - **`tag`**: `String` Tryte-encoded tag field of the transaction (which contains the encryption nonce)

#### Return Value

**`Object`**
 - **`root`**: `String` Root of the merkle tree
 - **`nextRoot`**: `String` Root of the next merkle tree
 - **`nextKey`**: `String` Tryte-encoded key for the next message in this chain
 - **`message`**: `String` Tryte-encoded message

---

### `MAM.channelKey`

Creates a `channelKey` for a given `seed` and `nonce`.

#### Input
```Javascript
MAM.channelKey(key, nonce)
```
1. **`key`**: `String` 81-trytes current channel key
2. **`nonce`**: `String` Random 27-tryte string

#### Return value

**`String`** Returns the next channel key.

---

### `MAM.messageID`

Returns the message ID for a given `channelKey` and `keyIndex`

#### Input
```Javascript
MAM.messageID(channelKey, keyIndex)
```
1. **`channelKey`**: `String` Channel Key
2. **`keyIndex`**: `Int` Key index

#### Return Value

**`String`** Returns the message ID.

---

### `MAM.messageHash`

Creates the hash of a tryte-encoded message

#### Input
```Javascript
MAM.messageHash(message)
```
1. **`message`**: `String` Tryte-encoded message

#### Return Value

**`String`** Returns the message hash

---

### `MAM.sign`

Creates the signature fragment.

#### Input
```Javascript
MAM.sign(message, key, bundle)
```
1. **`message`**: `String` Tryte-encoded message
2. **`key`**: `String` Signing key
3. **`bundle`**: `Object` Optional bundle object

#### Return Value

**`Array`** Returns an array of trytes

 ---

## MarkleTree

### `MerkleTree`

Creates a Merkle Tree instance.

#### Input
```Javascript
MerkleTree(seed, start, count, security)
```
1. **`seed`**: `String` 81-trytes seed
2. **`start`**: `Int`
3. **`count`**: `Int` Tree size
4. **`security`**: `Int` Security level. Can be 1, 2 or 3

---

### `MerkleTree.root`

```Javascript
MerkleTree.root
```
**`String`** Merkle tree root

---

### `MerkleTree.get`

#### Input
```Javascript
MerkleTree.get(index)
```
1. **`index`**: `Int`

#### Return value

**`Object`**
 - **`tree`**: `Array`
 - **`key`**: `String`

---

## Encryption

### `Encryption.encrypt`

Encrypts a tryte-encoded plaintext.

#### Input
```Javascript
Encryption.encrypt(message, key)
```
1. **`message`**: `String` Tryte-encoded plaintext
2. **`key`**: `String` Encryption key

#### Return value

**`String`** Returns the tryte-encoded ciphertext

---

### `Encryption.decrypt`

Decrypts a tryte-encoded ciphertext.

#### Input
```Javascript
Encryption.decrypt(message, key)
```
1. **`message`**: `String` Tryte-encoded plaintext
2. **`key`**: `String` Encryption key

#### Return value

**`String`** Returns the tryte-encoded plaintext

---

### `Encryption.increment`

Increments the given `subseed`

#### Input
```Javascript
Encryption.increment(subseed, count)
```
1. **`subseed`**: `String` 81-trytes subseed
2. **`count`**: `Int` Optional count

#### Return value

**`String`** Returns the incremented subseed

---

### `Encryption.hash`

Creates the hash of the given `key`.

#### Input
```Javascript
Encryption.hash(key, curl)
```
1. **`key`**: `String` Key
2. **`curl`**: `Object` Optional Curl object

#### Return value

**`String`** Returns the hash of the given key

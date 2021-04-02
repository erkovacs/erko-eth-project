const crypto = require('crypto');
const keccak = require('keccak');

module.exports = {
  hash: data => {
    const hash = keccak('keccak256')
      .update(data)
      .digest()
      .toString('hex');
    const bytes32 = `0x${hash}`;
    return bytes32;
  },

  generateKey: () => {
    const secret = crypto.randomBytes(16);
    return secret;
  },

  encryptAES: (data, key) => {
    const IV = Buffer.from([0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01]);

    let cipher = crypto.createCipheriv(
      'aes-128-cbc', Buffer.from(key, 'utf-8'), IV);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }
}
const express = require('express');
const bodyParser = require('body-parser');
const keccak = require('keccak');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const mappings = [];

const ENV = process.env.ENVIRONMENT || 'DEVELOPMENT';
const PORT = process.env.API_PORT || 5000;
const KEYS = process.env.API_KEYS || [];

const GROUPS = {
  CONTROL: 'CONTROL',
  TREATMENT: 'TREATMENT'
}

function hash (data) {
  const hash = keccak('keccak256')
    .update(data)
    .digest()
    .toString('hex');
  const bytes32 = `0x${hash}`;
  return bytes32;
}

if ('prod' === ENV) {
  app.use(express.static('./public/'));
}

app.use(bodyParser.json());

// Blind a patient when they enroll
app.post('/api/blind', function (req, res) {
  try {
    // 1. Get user account
    const account = req.body.account;

    const groups = [ GROUPS.CONTROL, GROUPS.TREATMENT ];

    // 2. Generate Mapping ID = keccak256(patient ID, group ID)
    const hashes = groups.map(group => hash(`${account}${group}`));

    // Find if we already have it...
    const mapping = mappings.find(_mapping => {
      return hashes[0] === _mapping.mappingId || hashes[1] === _mapping.mappingId;
    });

    if (mapping) {
      res.status(500).json({ success: false, error: 'Already enrolled!', mappingId: mapping.mappingId });
    } else {

      // 2. Fair coin toss to add user to Treatment or Control
      const random = Math.floor(Math.random() * 2);
      const i = random % 2 === 0 ? 0 : 1;

      // TODO:: perhaps a better way can be found. This can easily be bruteforced
      // 4. Store { Mapping ID, group type } tuple ???
      mappings.push({ mappingId: hashes[i], groupType: groups[i] });

      // 5. reply with success and Mapping ID
      res.status(200).json({ success: true, mappingId: hashes[i] });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.use(function (req, res, next) {
  const key = req.get('Api-Key');
  if (KEYS.indexOf(key) === -1) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
});

// check a mapping id if it is control or treatment
app.get('/api/blind/:mappingId', function (req, res) {
  try {
    const mappingId = req.params.mappingId;
    const mapping = mappings.find(_mapping => mappingId === _mapping.mappingId);
    if (mapping) {
      res.status(200).json({ success: true, mapping: mapping });
    }
    res.status(404).json({ success: false, error: 'Not found' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
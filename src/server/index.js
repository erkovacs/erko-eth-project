const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { hash, generateKey, encryptAES } = require('./utils');
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

if ('prod' === ENV) {
  app.use(express.static('./public/'));
}

app.use(bodyParser.json());

// Blind a patient when they enroll
app.post('/api/blind', function (req, res) {
  try {
    // 1. Get patient account and validate
    const account = req.body.account;
    if (!/^0x[a-fA-F0-9]{40}$/g.test(account)) {
      res.status(401).json({ success: false, error: 'Invalid account format. Please use a standard ETH address for the account.' });
      return;
    }

    const mapping = mappings.find(_mapping => account === _mapping.account);

    if (mapping) {
      res.status(400).json({ success: false, error: 'Already enrolled!' });
      return;
    } 
       
    const groups = [ GROUPS.CONTROL, GROUPS.TREATMENT ];

    // Generate a random AES key. It will be discarded afterwards
    const key = generateKey();

    // 2. Generate Mapping ID = keccak256(AES(keccak256(patient ID + group ID)))
    const hashes = groups.map(group => hash(`${account}${group}`), key);
    const mappingIds = hashes.map(_hash => hash(encryptAES(_hash, key)));

    // 3. Fair coin toss to add user to Treatment or Control
    const random = Math.floor(Math.random() * 2);
    const i = random % 2 === 0 ? 0 : 1;
    
    // 4. Store { mapping ID, account, group type } tuple
    mappings.push({ mappingId: mappingIds[i], account: account, groupType: groups[i] });

    // 5. reply with success and Mapping ID
    res.status(200).json({ success: true, mappingId: mappingIds[i] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Only allow authorised third party to access /blind/<mappingId> endpoint
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
      const { groupType } = mapping;
      res.status(200).json({ success: true, groupType: groupType });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
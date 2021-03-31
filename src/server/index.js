const express = require('express');
const bodyParser = require('body-parser');
const keccak = require('keccak');
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const mappings = [];

const PORT = process.env.API_PORT || 5000;
const ENV = process.env.ENVIRONMENT;

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
    // 1. Get user account
    const account = req.body.account;

    // 2. Fair coin toss to add user to Treatment or Control
    const random = Math.floor(Math.random() * 2);
    const group = random % 2 === 0 ? GROUPS.CONTROL : GROUPS.TREATMENT;

    // 3. Generate Mapping ID = keccak256(patient ID, group ID)
    const hash = keccak('keccak256')
      .update(`${account}${group}`)
      .digest()
      .toString('hex');
    const bytes32 = `0x${hash}`;

    // TODO:: perhaps a better way can be found
    // 4. Store { Mapping ID, group type } tuple ???
    mappings.push({ mappingId: bytes32, groupType: group });

    // 5. reply with success and Mapping ID
    res.status(200).json({ success: true, mappingId: bytes32 });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
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
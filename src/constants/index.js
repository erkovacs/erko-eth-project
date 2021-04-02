export const TITLE = 'Double Blind Study Support App';

export const Bytes32_NULL = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const GENDERS = [
  'male',
  'female',
  'other'
];

export const REPORT_TYPES = {
  NONE: {
    value: '',
    label: '-- None --'
  },
  TREATMENT_ADMINISTRATION_REPORT: {
    value: 'TREATMENT_ADMINISTRATION_REPORT',
    label: 'Treatment Administration Report'
  },
  STATUS_REPORT: {
    value: 'STATUS_REPORT',
    label: 'Status Report (self-assessment)'
  }
};

export const EXT_DRUGSTORE_API = {
  BASE_URL: process.env.REACT_APP_EXT_DRUGSTORE_API,
  VOUCHER: `${process.env.REACT_APP_EXT_DRUGSTORE_API}voucher`,
  ORDER: `${process.env.REACT_APP_EXT_DRUGSTORE_API}order`,
};

export const BLINDING_API = {
  BASE_URL: process.env.REACT_APP_BLINDING_API,
  BLIND: `${process.env.REACT_APP_BLINDING_API}blind`,
};
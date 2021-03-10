pragma solidity ^0.7.4;

contract DoubleBlindStudy {
    
    address payable internal pot;
    uint256 internal startDate;
    uint256 internal endDate;
    uint256 internal duration;
    
    uint256 internal patientCount;
    mapping (uint256 => Patient) internal patients;
    
    uint256 internal treatmentAdministrationReportCount;
    mapping (uint256 => TreatmentAdministrationReport) internal treatmentAdministrationReports;
    
    uint256 internal statusReportCount;
    mapping (uint256 => StatusReport) internal statusReports;
    
    enum Group {
        Treatment,
        Control
    }
    
    struct Patient {
        uint256 _id;
        address payable _address;
        Group _group;
        string _data;
        uint256 _registeredOn;
    }
    
    struct TreatmentAdministrationReport {
        uint256 _patientId;
        string _data;
        uint256 _administeredOn;
    }    
    
    struct StatusReport {
        uint256 _patientId;
        string _data;
        uint256 _reportedOn;
    }
    
    //
    // the deployer of the contract is the study monitor
    // 
    // they should provide address of a wallet with sufficient 
    // funds to finance expenses related to the study, called 
    // the pot
    // 
    // for miscellaneous transactions the patients are
    // expected to pay by themselves but this is mitigated
    // by the pot being redistributed at the end of the study 
    // to all participants
    //
    // startDate and duration are specified in seconds
    //
    constructor (address payable _pot, uint256 _startDate, uint256 _duration) {
        pot = _pot;
        duration = _duration;
        startDate = _startDate;
        endDate = startDate + _duration;
    }
    
    //
    // add a patient to the study
    //
    function registerPatient () public {}
    
    // 
    // assign patient to one of two groups - treatment or control
    //
    function _assignToGroup () internal {}
    
    //
    // obscure the data in such a way that no one can see which 
    // patient pertains to which group
    //
    function _blind () internal {}
    
    //
    // order a treatment kit -- real or placebo -- 
    // based on the nature of the patient. pay out of the pot 
    //
    function orderTreatmentKit () public {}
    
    //
    // records administration of a treatment kit to a patient
    //
    function administerTreatment () public {}
    
    //
    // records status of a patient following treatment administration
    // part of continuous self-assesment
    //
    function reportStatus () public {}
    
    // 
    // automatically fired at the end of the study (on endDate)
    // 
    function _concludeStudy () internal {}
    
    // 
    // reverse the blinding procedure
    //
    function _unblind () internal {}
}

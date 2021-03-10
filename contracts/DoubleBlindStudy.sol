pragma solidity ^0.7.4;

contract DoubleBlindStudy {
    
    address payable private pot;
    uint256 private startDate;
    uint256 private endDate;
    uint256 private duration;
    
    uint256 private patientCount;
    mapping (uint256 => Patient) private patients;
    
    uint256 private treatmentAdministrationReportCount;
    mapping (uint256 => TreatmentAdministrationReport) private treatmentAdministrationReports;
    
    uint256 private statusReportCount;
    mapping (uint256 => StatusReport) private statusReports;
    
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
        
        patientCount = 0;
        treatmentAdministrationReportCount = 0;
        statusReportCount = 0;
    }
    
    // helpers
    
    function _random(uint seed) private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, seed)));
    } 
    
    // business logic
    
    //
    // add a patient to the study
    //
    function registerPatient (address payable _address, string memory _data) public {
        patientCount++;
        patients[patientCount] = Patient(patientCount, _address, _assignToGroup(), _data, block.timestamp);
    }
    
    // 
    // assign patient to one of two groups - treatment or control
    //
    function _assignToGroup () private returns(Group) {
        uint seed = patientCount + treatmentAdministrationReportCount + statusReportCount;
        uint randInt = _random(seed);
        return randInt % 2 == 0 ? Group.Control : Group.Treatment;
    }
    
    //
    // obscure the data in such a way that no one can see which 
    // patient pertains to which group
    //
    // TODO:: find a solution for this. How can we blind the 
    // patient?
    //
    function _blind () private {}
    
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
    function _concludeStudy () private {}
    
    // 
    // reverse the blinding procedure
    //
    function _unblind () private {}
}
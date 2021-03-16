pragma solidity ^0.7.4;

contract DoubleBlindStudy {
    
    address payable private pot;
    uint private startDate;
    uint private endDate;
    uint private duration;
    
    uint private patientCount;
    mapping (bytes32 => Patient) private patients;
    
    uint private treatmentAdministrationReportCount;
    mapping (uint => TreatmentAdministrationReport) private treatmentAdministrationReports;
    
    uint private statusReportCount;
    mapping (uint => StatusReport) private statusReports;
    
    bool public active;
    
    modifier requireActive {
        require(active);
        _;
    }
    
    enum Group {
        Treatment,
        Control
    }
    
    struct Patient {
        uint _id;
        bytes32 _hash;
        Group _group;
        string _data;
        uint _enrolledOn;
    }
    
    struct TreatmentAdministrationReport {
        uint _patientId;
        string _data;
        uint _reportedOn;
    }    
    
    struct StatusReport {
        uint _patientId;
        string _data;
        uint _reportedOn;
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
    /*constructor (address payable _pot, uint256 _startDate, uint256 _duration) {
        pot = _pot;
        duration = _duration;
        startDate = _startDate;
        endDate = startDate + _duration;
        
        patientCount = 0;
        treatmentAdministrationReportCount = 0;
        statusReportCount = 0;
        
        // TODO:: deal with the logic here
        active = true;
    }*/

    //
    // TODO:: remove after debugging
    //
    constructor () {
        pot = msg.sender;
        duration = 60 * 60 * 24;
        uint ts = block.timestamp;
        startDate = ts;
        endDate = ts + duration;
        
        patientCount = 0;
        treatmentAdministrationReportCount = 0;
        statusReportCount = 0;

        active = true;
    }
    
    // helpers

    //
    // returns a pseudorandom number
    //
    function _random(uint seed) private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, seed)));
    } 
    
    //
    // The first transaction at or after 
    // the end date will deactivate the contract and
    // conclude the study. Ran at the end of all public 
    // calls to the contract
    //
    function _checkIfEnded () private {
        if (block.timestamp > endDate) {
            active = false;
            _concludeStudy();
        }
    }

    // business logic
    
    function isPatientEnrolled (address payable _address) public view requireActive returns (bytes32) {
        bytes32 _hash = keccak256(abi.encodePacked(_address));
        return patients[_hash]._hash;
    }
    
    function getPatientData (address payable _address) public view requireActive returns (uint, bytes32, string memory, uint) {
        bytes32 _hash = keccak256(abi.encodePacked(_address));
        Patient memory _patient = patients[_hash];
        return (_patient._id, _patient._hash, _patient._data, _patient._enrolledOn);
    }

    //
    // add a patient to the study
    //
    function enroll (string memory _data) public requireActive returns (bytes32) {
        patientCount++;
        address payable _address = msg.sender;
        bytes32 _hash = keccak256(abi.encodePacked(_address));
        uint ts = block.timestamp;
        patients[_hash] = Patient(patientCount, _hash, _assignToGroup(), _data, ts);
        return _hash;
    }
    
    // 
    // assign patient to one of two groups - treatment or control
    //
    function _assignToGroup () private view returns (Group) {
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
    function order () public requireActive {}
    
    //
    // records administration of a treatment kit to a patient
    //
    function reportTreatmentAdministration () public requireActive {}
    
    //
    // records status of a patient following treatment administration
    // part of continuous self-assesment
    //
    function reportStatus () public requireActive {}
    
    // 
    // fired at the end of the study (on or after endDate)
    // 
    function _concludeStudy () private {}
    
    // 
    // reverse the blinding procedure
    //
    function _unblind () private {}
}

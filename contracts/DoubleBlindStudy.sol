pragma solidity ^0.7.4;

contract DoubleBlindStudy {
    
    uint256 public patientCount;
    mapping (uint256 => Patient) public patients;
    
    enum Nature {
        Treatment,
        Control
    }
    
    struct Patient {
        uint256 _id;
        address _addr;
        Nature _group;
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
    
    function registerPatient () public {}
    
    function assignToGroup () internal {}
    
    function blind () internal {}
    
    function orderKit () public {}
    
    function administerTreatment () public {}
    
    function reportStatus () public {}
    
    function concludeStudy () internal {}
    
    function unblind () internal {}
}
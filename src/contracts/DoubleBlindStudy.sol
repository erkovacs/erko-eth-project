pragma solidity ^0.7.4;

contract DoubleBlindStudy {
    address payable private pot;
    uint256 private startDate;
    uint256 private endDate;
    uint256 private duration;

    uint256 private patientCount;
    mapping(bytes32 => Patient) private patients;

    uint256 private orderCount;
    mapping(uint256 => Order) private orders;
    mapping(bytes32 => uint256) private patientOrder;

    uint256 private reportCount;
    mapping(uint256 => Report) private reports;

    bool public active;

    modifier requireActive {
        require(active);
        _;
    }

    enum ReportType {TreatmentAdministration, Status}

    struct Patient {
        uint256 _id;
        bytes32 _patientId;
        bytes32 _mappingId;
        string _data;
        uint256 _enrolledOn;
    }

    struct Order {
        uint256 _id;
        bytes32 _patientId;
        string _voucher;
        uint256 _orderedOn;
    }

    struct Report {
        uint256 _id;
        ReportType _reportType;
        bytes32 _patientId;
        string _data;
        uint256 _reportedOn;
    }

    /*
      the deployer of the contract is the study monitor
      
      they should provide address of a wallet with sufficient 
      funds to finance expenses related to the study, called 
      the pot
      
      for miscellaneous transactions the patients are
      expected to pay by themselves but this is mitigated
      by the pot being redistributed at the end of the study 
      to all participants
      
      startDate and duration are specified in seconds
    */
    constructor(
        address payable _pot,
        uint256 _startDate,
        uint256 _duration
    ) {
        pot = _pot;
        duration = _duration;
        startDate = _startDate;
        endDate = startDate + _duration;

        patientCount = 0;
        reportCount = 0;
        orderCount = 0;

        // TODO:: deal with the logic here
        active = true;
    }

    // helpers

    /*
      The first transaction at or after
      the end date will deactivate the contract and
      conclude the study. Ran at the end of all public
      calls to the contract
    */
    function _checkIfEnded() private {
        if (block.timestamp > endDate) {
            active = false;
            _concludeStudy();
        }
    }

    function _getHash(address payable _address) private view returns (bytes32) {
        return keccak256(abi.encodePacked(_address));
    }

    // business logic

    /*
      Returns whether the specified patient is enrolled
    */
    function isPatientEnrolled(address payable _address)
        public
        view
        requireActive
        returns (bytes32)
    {
        bytes32 patientId = _getHash(_address);
        return patients[patientId]._patientId;
    }

    /*
      Returns patient data
    */
    function getPatientData(address payable _address)
        public
        view
        requireActive
        returns (
            uint256,
            bytes32,
            bytes32,
            string memory,
            uint256
        )
    {
        bytes32 patientId = _getHash(_address);
        Patient memory patient = patients[patientId];
        return (
            patient._id,
            patient._patientId,
            patient._mappingId,
            patient._data,
            patient._enrolledOn
        );
    }

    /*
      add a patient to the study
    */
    function enroll(bytes32 _mappingId, string memory _data)
        public
        requireActive
        returns (bytes32)
    {
        patientCount++;
        bytes32 patientId = _getHash(msg.sender);
        uint256 ts = block.timestamp;
        patients[patientId] = Patient(
            patientCount,
            patientId,
            _mappingId,
            _data,
            ts
        );
        return patientId;
    }

    /*
      obscure the data in such a way that no one can see which
      patient pertains to which group
     
      TODO:: find a solution for this. How can we blind the
      patient?
    */
    function _blind() private {}

    /*
      order a treatment kit -- real or placebo --
      based on the nature of the patient. pay out of the pot?
    */
    function order(string memory voucher) public requireActive {
        orderCount++;
        bytes32 patientId = _getHash(msg.sender);
        uint256 ts = block.timestamp;
        orders[orderCount] = Order(orderCount, patientId, voucher, ts);
        patientOrder[patientId] = orderCount;
    }

    function getCurrentOrder()
        public
        view
        requireActive
        returns (
            uint256,
            bytes32,
            string memory,
            uint256
        )
    {
        bytes32 patientId = _getHash(msg.sender);
        uint256 orderId = patientOrder[patientId];
        Order memory _order = orders[orderId];
        return (
            _order._id,
            _order._patientId,
            _order._voucher,
            _order._orderedOn
        );
    }

    /*
      Add a report of specified type and with specified data
    */
    function _addReport(ReportType _type, string memory _data) private {
        reportCount++;
        bytes32 patientId = _getHash(msg.sender);
        uint256 ts = block.timestamp;
        reports[reportCount] = Report(reportCount, _type, patientId, _data, ts);
        if (ReportType.TreatmentAdministration == _type) {
            patientOrder[patientId] = 0;
        }
    }

    /*
      records administration of a treatment kit to a patient
    */
    function reportTreatmentAdministration(string memory _data)
        public
        requireActive
    {
        _addReport(ReportType.TreatmentAdministration, _data);
    }

    /*
      records status of a patient following treatment administration
      part of continuous self-assesment
    */
    function reportStatus(string memory _data) public requireActive {
        _addReport(ReportType.Status, _data);
    }

    /*
     fired at the end of the study (on or after endDate)
    */
    function _concludeStudy() private {}

    /*
      reverse the blinding procedure
    */
    function _unblind() private {}
}

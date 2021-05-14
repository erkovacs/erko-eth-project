// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MEDToken.sol";

contract DoubleBlindStudy {

    using SafeMath for uint256;

    address private owner;
    MEDToken private pot;
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

    event StudyActivated(uint256 ts);
    event StudyConcluded(uint256 ts, string reason);
    event PatientRewarded(uint256 amount);

    modifier requireOwner {
        require(
            msg.sender == owner,
            "Error: only the owner can conclude the study"
        );
        _;
    }

    modifier requireActive {
        require(active, "Error: study is not active");
        _;
    }

    modifier requireConcluded {
        require(
            !active, /*&& (endDate <= block.timestamp)*/
            "Error: study has not yet been concluded"
        );
        _;
    }

    enum ReportType {TreatmentAdministration, Status}

    struct Patient {
        uint256 _id;
        bytes32 _patientId;
        bytes32 _mappingId;
        string _data;
        uint256 _enrolledOn;
        bool _hasBeenRewarded;
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
      the deployer of the contract is the study owner
      
      rewards will be distributed out of the pot, which 
      is an ERC20 compliant token
      
      for miscellaneous transactions the patients are
      expected to pay by themselves but this is mitigated
      by the pot being redistributed at the end of the study 
      to all participants
      
      startDate and duration are specified in seconds
    */
    constructor(
        address _owner,
        MEDToken _pot,
        uint256 _startDate,
        uint256 _duration
    ) {
        owner = _owner;
        pot = _pot;
        duration = _duration;
        startDate = _startDate;
        endDate = startDate + _duration;

        patientCount = 0;
        reportCount = 0;
        orderCount = 0;

        active = (startDate <= block.timestamp);
    }

    // helpers

    function _getHash(address payable _address) private view returns (bytes32) {
        return keccak256(abi.encodePacked(_address));
    }

    // business logic

    function getReportCount() public view returns (uint256) {
        return reportCount;
    }

    function getReport(uint256 index)
        public
        view
        returns (
            uint256,
            ReportType,
            bytes32,
            string memory,
            uint256
        )
    {
        Report memory report = reports[index];
        return (
            report._id,
            report._reportType,
            report._patientId,
            report._data,
            report._reportedOn
        );
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function activate() public requireOwner {
        active = true;
        emit StudyActivated(block.timestamp);
    }

    /*
      Returns whether the specified patient is enrolled
    */
    function isPatientEnrolled(address payable _address)
        public
        view
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
            ts,
            false
        );
        return patientId;
    }

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
    function conclude(string memory reason) public requireOwner requireActive {
        active = false;
        emit StudyConcluded(block.timestamp, reason);
    }

    /*
      returns whether the study has concluded
    */
    function isConcluded() public view returns (bool) {
        return !active; //&& (endDate <= block.timestamp);
    }

    /*
      called in order to distribute the reward to the
      caller 

      T_MED = 100 + (rc * 10) + (rc/mc * 100)
      T_MED = total MED rewarded
      rc = report count
      mc = month count
    */
    function claimReward() public requireConcluded {
        bytes32 patientId = _getHash(msg.sender);

        require(
            patients[patientId]._patientId != 0,
            "Error: patient has not been part of the study"
        );
        require(
            !patients[patientId]._hasBeenRewarded,
            "Error: patient has already been rewarded"
        );

        // calculate MED rewarded
        uint256 tMed = 100;
        uint256 mc = duration.div(2629800); // duration / seconds in a month
        uint256 rc = 0;
        uint256 rcPerMonth = 0;

        if (mc == 0) mc = 1; // handle div by 0

        for (uint256 i = 0; i < reportCount; i++) {
            if (patientId == reports[i]._patientId) {
                rc++;
            }
        }

        tMed = tMed.add(rc.mul(10));
        rcPerMonth = rc.div(mc);
        tMed = tMed.add(rcPerMonth.mul(100));

        pot.mint(msg.sender, tMed);
        patients[patientId]._hasBeenRewarded = true;
        
        emit PatientRewarded(tMed);
    }
}

const DoubleBlindStudy = artifacts.require("DoubleBlindStudy");

module.exports = function (deployer, network, accounts) {
  const userAddress = accounts[0];
  const startDate = Math.round(Date.now() / 1000);
  const duration = 60 * 10;
  deployer.deploy(DoubleBlindStudy, userAddress, startDate, duration);
};

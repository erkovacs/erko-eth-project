const DoubleBlindStudy = artifacts.require("DoubleBlindStudy");
const MEDToken = artifacts.require("MEDToken");

module.exports = async function (deployer, network, accounts) {
  // Deploy MED token
  await deployer.deploy(MEDToken);
  const token = await MEDToken.deployed();

  // Deployer is owner of contract
  // UNIX timestamp for start of study
  // duration of study in seconds
  const userAddress = accounts[0];
  const startDate = Math.round(Date.now() / 1000);
  const duration = 60 * 10;

  // Deploy study
  await deployer.deploy(DoubleBlindStudy, userAddress, token.address, startDate, duration);
  const study = await DoubleBlindStudy.deployed();

  // Set study as minter
  await token.setMinter(study.address);
};

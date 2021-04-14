const DoubleBlindStudy = artifacts.require("DoubleBlindStudy");
const Token = artifacts.require("Token");

module.exports = async function (deployer, network, accounts) {
  // Deploy token
  await deployer.deploy(Token);
  const token = await Token.deployed();

  // Deployer is owner of contract
  const userAddress = accounts[0];
  
  // UNIX timestamp for start of study
  const startDate = Math.round(Date.now() / 1000);
  
  // duration of study in seconds
  const duration = 60 * 10;

  // Deploy study
  await deployer.deploy(DoubleBlindStudy, userAddress, token.address, startDate, duration);
  const study = await DoubleBlindStudy.deployed();

  // Set study as minter
  await token.setMinter(study.address);
};

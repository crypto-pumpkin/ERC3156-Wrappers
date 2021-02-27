const solomargin = {
  'homestead' : '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e',
  'kovan' : '0x4EC3570cADaAEE08Ae384779B0f3A45EF85289DE'
};

const uniswap = {
  '1' : {
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    dai : '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  '42' : {
    factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    weth : '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    dai : '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  },
  '250' : {
    factory: '0xbfd1ce8e6d85e911e80c169293d5c1f5c950fe03',
    weth : '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wFTM
    dai : '0xad84341756bf337f5a0164515b1f6f993d194e1f', // fUSD
  }
}

async function main() {
  const [ deployer ] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  const deployerBalance = await deployer.getBalance();
  console.log(`Deployer balance: ${deployerBalance}`);

  const provider = deployer.provider;
  const network = await provider.getNetwork();
  console.log(`Network ${network.chainId}: ${network.name} is ${network.name === 'kovan'}`);

  const networkGasPrice = (await provider.getGasPrice()).toNumber();
  const gasPrice = networkGasPrice * 1.1;
  console.log(`Gas Price balance: ${gasPrice}`);

  // deploy dydx wrapper
  // console.log(`solomargin address: ${solomargin[network.name]}`);
  // const DYDXERC3156 = await ethers.getContractFactory('DYDXERC3156');
  // const dydxWrapper = await DYDXERC3156.deploy(solomargin[network.name]);
  // await dydxWrapper.deployed();
  // console.log(`dydxWrapper address: ${dydxWrapper.address}`);

  // deploy uniswap wrapper
  console.log(`uniswap addresses: ${uniswap[network.chainId]}`);
  const UniswapERC3156 = await ethers.getContractFactory('UniswapERC3156');
  const uniAddresses = uniswap[network.chainId];
  const uniswapERC3156 = await UniswapERC3156.deploy(uniAddresses.factory, uniAddresses.weth, uniAddresses.dai);
  await uniswapERC3156.deployed();
  console.log(`uniswapERC3156 address: ${uniswapERC3156.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

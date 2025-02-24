const {
  callReadOnlyFunction,
  standardPrincipalCV,
  contractPrincipalCV,
  cvToJSON,
  uintCV,
} = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');

const CONFIG = {
  zest: {
    contractAddress: 'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.zsbtc-v2-0',
    contractName: 'pool-reserve-data',
    functionName: 'get-user-reserve-data',
  },
  alex: {
    contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
    contractName: 'amm-pool-v2-01',
    functionName: 'get-balances',
  },
  arkadiko: {
    contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    contractName: 'arkadiko-swap-v2-1',
    functionName: 'get-position',
  },
  stackingDao: {
    contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG',
    contractName: 'stacking-dao-core-v4',
    functionName: 'get-stacker-info',
  },
};

const network = "mainnet";

const SBTC_CONTRACT_ADDRESS = 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR';
const SBTC_CONTRACT_NAME = 'wrapped-bitcoin';

async function queryReadOnly(contractConfig, userAddress, additionalArgs = []) {
  const options = {
    contractAddress: contractConfig.contractAddress,
    contractName: contractConfig.contractName,
    functionName: contractConfig.functionName,
    functionArgs: [standardPrincipalCV(userAddress), ...additionalArgs],
    senderAddress: userAddress,
    network,
  };

  try {
    const result = await callReadOnlyFunction(options);
    return cvToJSON(result);
  } catch (error) {
    console.error(`Error querying ${contractConfig.contractName}.${contractConfig.functionName}:`, error);
    return null;
  }
}

async function aggregateUserPositions(userAddress) {
  console.log(`Querying sBTC-related positions for user: ${userAddress}\n`);

  const results = {};
  
  results.zestDeposit = await queryReadOnly(CONFIG.zest, userAddress, [
    contractPrincipalCV(SBTC_CONTRACT_ADDRESS, SBTC_CONTRACT_NAME)
  ]);
  
  results.alexPosition = await queryReadOnly(CONFIG.alex, userAddress);
  
  results.arkadikoPosition = await queryReadOnly(CONFIG.arkadiko, userAddress, [uintCV(0)]);
  
  results.stackingInfo = await queryReadOnly(CONFIG.stackingDao, userAddress);

  return results;
}

const exampleWallet = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';

async function main() {
  const aggregated = await aggregateUserPositions(exampleWallet);
  console.log('\nAggregated sBTC Positions:');
  console.log(JSON.stringify(aggregated, null, 2));
}

main();

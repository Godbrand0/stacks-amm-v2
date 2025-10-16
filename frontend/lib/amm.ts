import { STACKS_TESTNET } from "@stacks/network";
import {
  boolCV,
  bufferCV,
  Cl,
  cvToHex,
  fetchCallReadOnlyFunction,
  hexToCV,
  principalCV,
  PrincipalCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

const AMM_CONTRACT_ADDRESS = "ST262V9NFZ5TCQDQM1R2BSXSE84NJBXN61HM909Z0";
const AMM_CONTRACT_NAME = "amm-v7";
const AMM_CONTRACT_PRINCIPAL = `${AMM_CONTRACT_ADDRESS}.${AMM_CONTRACT_NAME}`;

type ContractEvent = {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log: {
    contract_id: string;
    topic: string;
    value: {
      hex: string;
      repr: string;
    };
  };
};

// Type definitions for pool data structures
// Updated to include pool statistics tracking
type PoolCV = {
  "token-0": PrincipalCV;
  "token-1": PrincipalCV;
  fee: UIntCV;
  liquidity: UIntCV;
  "balance-0": UIntCV;
  "balance-1": UIntCV;
  // Pool statistics fields from smart contract
  "total-volume-0": UIntCV;
  "total-volume-1": UIntCV;
  "total-fees-collected": UIntCV;
  "swap-count": UIntCV;
};

export type Pool = {
  id: string;
  "token-0": string;
  "token-1": string;
  fee: number;
  liquidity: number;
  "balance-0": number;
  "balance-1": number;
  // Pool performance metrics
  "total-volume-0": number;      // Cumulative trading volume for token-0
  "total-volume-1": number;      // Cumulative trading volume for token-1
  "total-fees-collected": number; // Total fees earned by liquidity providers
  "swap-count": number;          // Number of swaps executed in this pool
};

export type Transaction = {
  txId: string;
  type: string;
  timestamp: string;
  status: string;
  amount: number;
  tokenIn: string;
  tokenOut: string;
};

// getAllPools
// Returns an array of Pool objects
export async function getAllPools() {
  let offset = 0;
  let done = false;

  const pools: Pool[] = [];

  // We can fetch 50 events at a time, so we run a loop until we've fetched all events
  while (!done) {
    const url = `http://api.testnet.hiro.so/extended/v1/contract/${AMM_CONTRACT_PRINCIPAL}/events?limit=50&offset=${offset}`;
    const events = (await fetch(url).then((res) => res.json()))
      .results as ContractEvent[];

    // if at any point we're getting less than 50 events back, then this is the last iteration
    if (events.length < 50) {
      done = true;
    }

    // from all events from the smart contract, only keep those which are `smart_contract_log` (remove token transfers, etc)
    const filteredEvents = events.filter((event: ContractEvent) => {
      return event.event_type === "smart_contract_log";
    });

    for (const event of filteredEvents) {
      const contractLog = event.contract_log;
      if (contractLog.contract_id !== AMM_CONTRACT_PRINCIPAL) continue;
      if (contractLog.topic !== "print") continue;

      // for each event, only care about ones which have action = "create-pool"
      const data = hexToCV(contractLog.value.hex);
      if (data.type !== "tuple") continue;
      if (data.value["action"] === undefined) continue;
      if (data.value["action"].type !== "ascii") continue;
      if (data.value["action"]["value"] !== "create-pool") continue;
      if (data.value["data"].type !== "tuple") continue;

      const poolInitialData = data.value["data"].value as PoolCV;

      // get the pool id from the pool initial data
      const poolIdResult = await fetchCallReadOnlyFunction({
        contractAddress: AMM_CONTRACT_ADDRESS,
        contractName: AMM_CONTRACT_NAME,
        functionName: "get-pool-id",
        functionArgs: [
          Cl.tuple({
            "token-0": poolInitialData["token-0"],
            "token-1": poolInitialData["token-1"],
            fee: poolInitialData.fee,
          }),
        ],
        senderAddress: AMM_CONTRACT_ADDRESS,
        network: STACKS_TESTNET,
      });
      if (poolIdResult.type !== "buffer") continue;
      const poolId = poolIdResult.value;

      // get the pool data from the pool id
      const poolDataResult = await fetchCallReadOnlyFunction({
        contractAddress: AMM_CONTRACT_ADDRESS,
        contractName: AMM_CONTRACT_NAME,
        functionName: "get-pool-data",
        functionArgs: [poolIdResult],
        senderAddress: AMM_CONTRACT_ADDRESS,
        network: STACKS_TESTNET,
      });

      if (poolDataResult.type !== "ok") continue;
      if (poolDataResult.value.type !== "some") continue;
      if (poolDataResult.value.value.type !== "tuple") continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poolData = poolDataResult.value.value.value as any;

      // Helper function to safely parse uint clarity values
      // Returns 0 if the value is undefined or not a uint type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseUintCV = (cv: any): number => {
        if (!cv) return 0;
        if (cv.type === "uint") {
          return Number(cv.value);
        }
        return 0;
      };

      // Convert the pool data from Clarity values to JavaScript Pool object
      // Includes both core pool data and statistics tracking fields
      const pool: Pool = {
        id: poolId,
        "token-0": poolInitialData["token-0"].value,
        "token-1": poolInitialData["token-1"].value,
        fee: parseInt(poolInitialData["fee"].value.toString()),
        liquidity: Number(poolData["liquidity"].value),
        "balance-0": Number(poolData["balance-0"].value),
        "balance-1": Number(poolData["balance-1"].value),
        // Parse pool statistics - safely handle undefined values
        "total-volume-0": parseUintCV(poolData["total-volume-0"]),
        "total-volume-1": parseUintCV(poolData["total-volume-1"]),
        "total-fees-collected": parseUintCV(poolData["total-fees-collected"]),
        "swap-count": parseUintCV(poolData["swap-count"]),
      };

      pools.push(pool);

      offset = event.event_index;
    }
  }

  return pools;
}

export async function createPool(token0: string, token1: string, fee: number) {
  const token0Hex = cvToHex(principalCV(token0));
  const token1Hex = cvToHex(principalCV(token1));
  if (token0Hex > token1Hex) {
    [token0, token1] = [token1, token0];
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "create-pool",
    functionArgs: [principalCV(token0), principalCV(token1), uintCV(fee)],
  };

  return txOptions;
}

export async function addLiquidity(
  pool: Pool,
  amount0: number,
  amount1: number
) {
  if (amount0 === 0 || amount1 === 0) {
    throw new Error("Cannot add liquidity with 0 amount");
  }

  // If this is not initial liquidity, we need to add amounts in a ratio of the price
  if (pool.liquidity > 0) {
    const poolRatio = pool["balance-0"] / pool["balance-1"];

    const idealAmount1 = Math.floor(amount0 / poolRatio);
    if (amount1 < idealAmount1) {
      throw new Error(
        `Cannot add liquidity in these amounts. You need to supply at least ${idealAmount1} ${
          pool["token-1"].split(".")[1]
        } along with ${amount0} ${pool["token-0"].split(".")[1]}`
      );
    }
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "add-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount0),
      uintCV(amount1),
      uintCV(0),
      uintCV(0),
    ],
  };

  return txOptions;
}

export async function removeLiquidity(pool: Pool, liquidity: number) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "remove-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(liquidity),
    ],
  };

  return txOptions;
}

export async function swap(pool: Pool, amount: number, zeroForOne: boolean) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "swap",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount),
      boolCV(zeroForOne),
    ],
  };

  return txOptions;
}

export async function getUserLiquidity(pool: Pool, user: string) {
  const userLiquidityResult = await fetchCallReadOnlyFunction({
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "get-position-liquidity",
    functionArgs: [bufferCV(Buffer.from(pool.id, "hex")), principalCV(user)],
    senderAddress: AMM_CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  if (userLiquidityResult.type !== "ok") return 0;
  if (userLiquidityResult.value.type !== "uint") return 0;
  return parseInt(userLiquidityResult.value.value.toString());
}

export async function getTokenBalance(tokenContract: string, user: string) {
  const [contractAddress, contractName] = tokenContract.split(".");

  const balanceResult = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-balance",
    functionArgs: [principalCV(user)],
    senderAddress: user,
    network: STACKS_TESTNET,
  });

  if (balanceResult.type !== "ok") return 0;
  if (balanceResult.value.type !== "uint") return 0;
  return parseInt(balanceResult.value.value.toString());
}

export async function getUserTransactionHistory(address: string) {
  try {
    // Fetch transactions from Hiro API
    const response = await fetch(
      `https://api.testnet.hiro.so/extended/v1/address/${address}/transactions?limit=50`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }

    const data = await response.json();
    const transactions: Transaction[] = [];

    // Filter for contract calls to your AMM contract
    for (const tx of data.results) {
      if (
        tx.tx_type === "contract_call" &&
        tx.contract_call?.contract_id === AMM_CONTRACT_PRINCIPAL
      ) {
        // Parse transaction details
        const functionName = tx.contract_call.function_name;
        let amount = 0;
        let tokenIn = "N/A";
        let tokenOut = "N/A";

        // Extract details based on function called
        if (functionName === "swap") {
          // Parse swap details from function arguments
          const args = tx.contract_call.function_args || [];

          // Get input amount (3rd argument, index 3)
          const inputAmountArg = args[3];
          if (inputAmountArg?.repr) {
            amount = parseInt(inputAmountArg.repr.replace("u", ""));
          }

          // Get swap direction (4th argument, index 4)
          const zeroForOne = args[4]?.repr === "true";

          // Extract token names from principals (0th and 1st arguments)
          const token0 = args[0]?.repr || "";
          const token1 = args[1]?.repr || "";

          // Get simple token names from contract names
          const token0Name = token0.split(".")[1] || "Token0";
          const token1Name = token1.split(".")[1] || "Token1";

          tokenIn = zeroForOne ? token0Name : token1Name;
          tokenOut = zeroForOne ? token1Name : token0Name;
        } else if (functionName === "add-liquidity") {
          // Parse add-liquidity details
          const args = tx.contract_call.function_args || [];

          // Get amount-0-desired (3rd argument, index 3)
          const amount0Arg = args[3];
          if (amount0Arg?.repr) {
            amount = parseInt(amount0Arg.repr.replace("u", ""));
          }

          tokenIn = "Both tokens";
          tokenOut = "LP tokens";
        } else if (functionName === "remove-liquidity") {
          // Parse remove-liquidity details
          const args = tx.contract_call.function_args || [];

          // Get liquidity amount (3rd argument, index 3)
          const liquidityArg = args[3];
          if (liquidityArg?.repr) {
            amount = parseInt(liquidityArg.repr.replace("u", ""));
          }

          tokenIn = "LP tokens";
          tokenOut = "Both tokens";
        }

        transactions.push({
          txId: tx.tx_id,
          type: functionName,
          timestamp: tx.burn_block_time_iso,
          status: tx.tx_status === "success" ? "Success" : "Failed",
          amount: amount,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
        });
      }
    }

    return transactions;
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}

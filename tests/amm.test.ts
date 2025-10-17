import { Cl } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

// Simnet is provided globally by @hirosystems/clarinet-sdk
declare const simnet: any;
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

const mockTokenOne = Cl.contractPrincipal(deployer, "mock-token-9");
const mockTokenTwo = Cl.contractPrincipal(deployer, "mock-token-10");

describe("AMM Tests", () => {
  beforeEach(() => {
    const allAccounts = [alice, bob, charlie];

    for (const account of allAccounts) {
      const mintResultOne = simnet.callPublicFn(
        "mock-token-9",
        "mint",
        [Cl.uint(1_000_000_000), Cl.principal(account)],
        account
      );

      expect(mintResultOne.events.length).toBeGreaterThan(0);

      const mintResultTwo = simnet.callPublicFn(
        "mock-token-10",
        "mint",
        [Cl.uint(1_000_000_000), Cl.principal(account)],
        account
      );

      expect(mintResultTwo.events.length).toBeGreaterThan(0);
    }
  });

  it("allows pool creation", () => {
    const { result, events } = createPool();

    expect(result).toBeOk(Cl.bool(true));
    expect(events.length).toBe(1);
  });

  it("disallows creation of same pool twice", () => {
    const { result: result1 } = createPool();
    expect(result1).toBeOk(Cl.bool(true));

    const { result: result2 } = createPool();
    expect(result2).toBeErr(Cl.uint(200));
  });

  it("adds initial liquidity in whatever ratio", () => {
    const createPoolRes = createPool();
    expect(createPoolRes.result).toBeOk(Cl.bool(true));

    const addLiqRes = addLiquidity(alice, 1000000, 500000);

    expect(addLiqRes.result).toBeOk(Cl.bool(true));
    expect(addLiqRes.events.length).toBe(3);
  });

  it("requires n+1 add liquidity calls to maintain ratio", () => {
    const createPoolRes = createPool();
    expect(createPoolRes.result).toBeOk(Cl.bool(true));

    const addLiqRes = addLiquidity(alice, 1000000, 500000);
    expect(addLiqRes.result).toBeOk(Cl.bool(true));
    expect(addLiqRes.events.length).toBe(3);

    const secondAddLiqRes = addLiquidity(alice, 5000, 10000000);
    expect(secondAddLiqRes.result).toBeOk(Cl.bool(true));
    expect(secondAddLiqRes.events.length).toBe(3);
    expect(secondAddLiqRes.events[0].event).toBe("ft_transfer_event");
    expect(secondAddLiqRes.events[0].data.amount).toBe("5000");
    expect(secondAddLiqRes.events[1].event).toBe("ft_transfer_event");
    expect(secondAddLiqRes.events[1].data.amount).toBe("2500");
  });

  it("allows removing liquidity except minimum liquidity", () => {
    createPool();
    addLiquidity(alice, 1000000, 500000);

    const { result: poolId } = getPoolId();
    const aliceLiquidity = simnet.callReadOnlyFn(
      "amm-v7",
      "get-position-liquidity",
      [poolId, Cl.principal(alice)],
      alice
    );
    expect(aliceLiquidity.result).toBeOk(Cl.uint(706106));

    const { result, events } = removeLiquidity(alice, 706106);
    expect(result).toBeOk(Cl.bool(true));

    const tokenOneAmountWithdrawn = parseInt(events[0].data.amount);
    const tokenTwoAmountWithdrawn = parseInt(events[1].data.amount);

    expect(tokenOneAmountWithdrawn).toBe(998585);
    expect(tokenTwoAmountWithdrawn).toBe(499292);
  });

  it("should allow for swaps", () => {
    createPool();
    addLiquidity(alice, 1000000, 500000);

    const { result, events } = swap(alice, 100000, true);

    expect(result).toBeOk(Cl.bool(true));
    expect(events[0].data.amount).toBe("100000");
    expect(events[1].data.amount).toBe("43183");
  });

  it("should distribute fees earned amongst LPs", () => {
    createPool();
    addLiquidity(alice, 1000000, 500000);

    swap(alice, 100000, true);

    // after locking up minimum liquidity
    const withdrawableTokenOnePreSwap = 998585;
    const withdrawableTokenTwoPreSwap = 499292;

    const { result, events } = removeLiquidity(alice, 706106);
    expect(result).toBeOk(Cl.bool(true));

    const tokenOneAmountWithdrawn = parseInt(events[0].data.amount);
    const tokenTwoAmountWithdrawn = parseInt(events[1].data.amount);

    expect(tokenOneAmountWithdrawn).toBeGreaterThan(
      withdrawableTokenOnePreSwap
    );
    expect(tokenTwoAmountWithdrawn).toBeLessThan(withdrawableTokenTwoPreSwap);
  });

  // ============================================
  // Pool Statistics Tests
  // ============================================

  it("initializes pool statistics to zero on pool creation", () => {
    createPool();

    const { result: poolId } = getPoolId();
    const poolData = simnet.callReadOnlyFn(
      "amm-v7",
      "get-pool-data",
      [poolId],
      alice
    );

    expect(poolData.result).toBeOk(Cl.some(Cl.tuple({
      "token-0": mockTokenOne,
      "token-1": mockTokenTwo,
      fee: Cl.uint(500),
      liquidity: Cl.uint(0),
      "balance-0": Cl.uint(0),
      "balance-1": Cl.uint(0),
      "total-volume-0": Cl.uint(0),
      "total-volume-1": Cl.uint(0),
      "total-fees-collected": Cl.uint(0),
      "swap-count": Cl.uint(0),
    })));
  });

  it("tracks statistics after a single swap (zero-for-one)", () => {
    createPool();
    addLiquidity(alice, 1000000, 500000);

    // Perform swap: 100000 of token-0 for token-1
    const swapAmount = 100000;
    const { result } = swap(alice, swapAmount, true);
    expect(result).toBeOk(Cl.bool(true));

    // Check pool statistics
    const { result: poolId } = getPoolId();
    const poolDataResponse = simnet.callReadOnlyFn(
      "amm-v7",
      "get-pool-data",
      [poolId],
      alice
    );

    // Extract the pool data from (ok (some {...}))
    expect(poolDataResponse.result.type).toBe(7); // ok type
    const someValue = poolDataResponse.result.value;
    expect(someValue.type).toBe(10); // some type
    const poolData = someValue.value;

    // Check statistics - volume for token-0 should be updated
    expect(poolData.data["total-volume-0"]).toBeUint(swapAmount);
    // Volume for token-1 should still be 0 (it's the output token)
    expect(poolData.data["total-volume-1"]).toBeUint(0);
    // Swap count should be 1
    expect(poolData.data["swap-count"]).toBeUint(1);
    // Fees should be collected
    expect(poolData.data["total-fees-collected"].value).toBeGreaterThan(0n);
  });

  it("accumulates statistics across multiple swaps in both directions", () => {
    createPool();
    addLiquidity(alice, 1000000, 500000);

    // First swap: 100000 of token-0 for token-1
    const firstSwapAmount = 100000;
    swap(alice, firstSwapAmount, true);

    // Second swap: 50000 of token-1 for token-0
    const secondSwapAmount = 50000;
    swap(bob, secondSwapAmount, false);

    // Third swap: 75000 of token-0 for token-1
    const thirdSwapAmount = 75000;
    swap(charlie, thirdSwapAmount, true);

    // Check pool statistics
    const { result: poolId } = getPoolId();
    const poolDataResponse = simnet.callReadOnlyFn(
      "amm-v7",
      "get-pool-data",
      [poolId],
      alice
    );

    // Extract the pool data from (ok (some {...}))
    const someValue = poolDataResponse.result.value;
    const poolData = someValue.value;

    // Total volume for token-0: first swap (100000) + third swap (75000) = 175000
    const expectedVolume0 = firstSwapAmount + thirdSwapAmount;
    expect(poolData.data["total-volume-0"]).toBeUint(expectedVolume0);

    // Total volume for token-1: second swap (50000)
    expect(poolData.data["total-volume-1"]).toBeUint(secondSwapAmount);

    // Swap count should be 3
    expect(poolData.data["swap-count"]).toBeUint(3);

    // Fees should have accumulated from all 3 swaps
    expect(poolData.data["total-fees-collected"].value).toBeGreaterThan(0n);
  });
});

function createPool() {
  return simnet.callPublicFn(
    "amm-v7",
    "create-pool",
    [mockTokenOne, mockTokenTwo, Cl.uint(500)],
    alice
  );
}

function addLiquidity(account: string, amount0: number, amount1: number) {
  return simnet.callPublicFn(
    "amm-v7",
    "add-liquidity",
    [
      mockTokenOne,
      mockTokenTwo,
      Cl.uint(500),
      Cl.uint(amount0),
      Cl.uint(amount1),
      Cl.uint(0),
      Cl.uint(0),
    ],
    account
  );
}

function removeLiquidity(account: string, liquidity: number) {
  return simnet.callPublicFn(
    "amm-v7",
    "remove-liquidity",
    [mockTokenOne, mockTokenTwo, Cl.uint(500), Cl.uint(liquidity)],
    account
  );
}

function swap(account: string, inputAmount: number, zeroForOne: boolean) {
  return simnet.callPublicFn(
    "amm-v7",
    "swap",
    [
      mockTokenOne,
      mockTokenTwo,
      Cl.uint(500),
      Cl.uint(inputAmount),
      Cl.bool(zeroForOne),
    ],
    account
  );
}

function getPoolId() {
  return simnet.callReadOnlyFn(
    "amm-v7",
    "get-pool-id",
    [
      Cl.tuple({
        "token-0": mockTokenOne,
        "token-1": mockTokenTwo,
        fee: Cl.uint(500),
      }),
    ],
    alice
  );
}

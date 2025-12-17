import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "Can borrow against collateral",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'borrow', [
        types.uint(1000000000), // 1000 STX collateral
        types.uint(500000000)   // 500 STX borrow
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Cannot borrow with insufficient collateral",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'borrow', [
        types.uint(100000000),  // 100 STX collateral
        types.uint(500000000)   // 500 STX borrow - too much!
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(4004);
  }
});

Clarinet.test({
  name: "Can calculate interest",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    // First create a loan
    let block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'borrow', [
        types.uint(1000000000),
        types.uint(500000000)
      ], wallet1.address)
    ]);
    
    // Calculate interest
    let result = chain.callReadOnlyFn(
      'sbtc-lending',
      'calculate-interest',
      [types.uint(1)],
      wallet1.address
    );
    
    result.result.expectOk();
  }
});

Clarinet.test({
  name: "Can get health factor",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'borrow', [
        types.uint(1000000000),
        types.uint(500000000)
      ], wallet1.address)
    ]);
    
    let result = chain.callReadOnlyFn(
      'sbtc-lending',
      'get-health-factor',
      [types.uint(1)],
      wallet1.address
    );
    
    result.result.expectOk();
  }
});

Clarinet.test({
  name: "Can generate loan receipt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let result = chain.callReadOnlyFn(
      'sbtc-lending',
      'generate-loan-receipt',
      [types.uint(1), types.uint(500000000), types.uint(1000000000)],
      deployer.address
    );
    
    assertExists(result.result);
  }
});

Clarinet.test({
  name: "Can add collateral to existing loan",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create loan
    let block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'borrow', [
        types.uint(1000000000),
        types.uint(500000000)
      ], wallet1.address)
    ]);
    
    // Add more collateral
    block = chain.mineBlock([
      Tx.contractCall('sbtc-lending', 'add-collateral', [
        types.uint(1),
        types.uint(200000000)
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Get protocol stats",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let result = chain.callReadOnlyFn(
      'sbtc-lending',
      'get-protocol-stats',
      [],
      deployer.address
    );
    
    assertExists(result.result);
  }
});

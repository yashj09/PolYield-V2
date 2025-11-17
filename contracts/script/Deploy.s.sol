// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CrossChainYieldAggregator.sol";


contract DeployScript is Script {
    // Deployment configuration
    CrossChainYieldAggregator public aggregator;
    
    // Mock token addresses for testing (replace with actual Paseo AssetHub tokens)
    address constant MOCK_DOT = address(0x1111111111111111111111111111111111111111);
    address constant MOCK_USDT = address(0x2222222222222222222222222222222222222222);
    address constant MOCK_USDC = address(0x3333333333333333333333333333333333333333);
    
    // Parachain IDs (standard Polkadot ecosystem)
    uint256 constant MOONBEAM_PARACHAIN_ID = 2004;
    uint256 constant ACALA_PARACHAIN_ID = 2000;
    uint256 constant HYDRATION_PARACHAIN_ID = 2034;
    uint256 constant BIFROST_PARACHAIN_ID = 2030;
    
    // Mock protocol addresses (replace with actual protocol addresses)
    address constant MOONWELL_PROTOCOL = address(0x4444444444444444444444444444444444444444);
    address constant ACALA_LENDING = address(0x5555555555555555555555555555555555555555);
    address constant HYDRATION_OMNIPOOL = address(0x6666666666666666666666666666666666666666);
    address constant BIFROST_LIQUID_STAKING = address(0x7777777777777777777777777777777777777777);
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("==================================================");
        console.log("Deploying CrossChainYieldAggregator");
        console.log("==================================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Balance:", deployer.balance);
        console.log("==================================================");
        
        require(deployer.balance > 0, "Deployer has no balance!");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy main contract
        console.log("\n1. Deploying CrossChainYieldAggregator...");
        aggregator = new CrossChainYieldAggregator();
        console.log("   Deployed at:", address(aggregator));
        
        // 2. Setup initial vaults
        console.log("\n2. Setting up initial vaults...");
        setupVaults();
        
        // 3. Configure strategist (deployer as initial strategist)
        console.log("\n3. Configuring strategist...");
        aggregator.setStrategist(deployer, true);
        console.log("   Strategist set:", deployer);
        
        vm.stopBroadcast();
        
        // 4. Display deployment summary
        printDeploymentSummary();
        
        console.log("\n==================================================");
        console.log("Deployment Complete!");
        console.log("==================================================");
    }
    
    function setupVaults() internal {
        console.log("\n   Creating vaults...");
        
        // Vault 1: Moonbeam - Moonwell Lending (DOT)
        aggregator.createVault(
            MOCK_DOT,                    // token
            MOONBEAM_PARACHAIN_ID,       // parachainId
            MOONWELL_PROTOCOL,           // targetProtocol
            850,                          // 8.5% APY (in basis points)
            5,                            // Medium risk
            "Moonwell Lending"           // strategyType
        );
        console.log("   ✓ Vault 0: Moonbeam - Moonwell Lending (DOT) - 8.5% APY");
        
        // Vault 2: Acala - Lending Protocol (USDT)
        aggregator.createVault(
            MOCK_USDT,                   // token
            ACALA_PARACHAIN_ID,          // parachainId
            ACALA_LENDING,               // targetProtocol
            1250,                         // 12.5% APY
            6,                            // Medium-high risk
            "Acala Lending"              // strategyType
        );
        console.log("   ✓ Vault 1: Acala - Lending Protocol (USDT) - 12.5% APY");
        
        // Vault 3: HydraDX - Omnipool LP (DOT)
        aggregator.createVault(
            MOCK_DOT,                    // token
            HYDRATION_PARACHAIN_ID,      // parachainId
            HYDRATION_OMNIPOOL,          // targetProtocol
            1800,                         // 18% APY
            7,                            // Higher risk (LP exposure)
            "Omnipool LP"                // strategyType
        );
        console.log("   ✓ Vault 2: HydraDX - Omnipool LP (DOT) - 18% APY");
        
        // Vault 4: Bifrost - Liquid Staking (DOT)
        aggregator.createVault(
            MOCK_DOT,                    // token
            BIFROST_LIQUID_STAKING,      // parachainId
            BIFROST_LIQUID_STAKING,      // targetProtocol
            1150,                         // 11.5% APY
            3,                            // Lower risk (liquid staking)
            "Liquid Staking"             // strategyType
        );
        console.log("   ✓ Vault 3: Bifrost - Liquid Staking (DOT) - 11.5% APY");
        
        // Vault 5: Acala - Stable LP (USDC)
        aggregator.createVault(
            MOCK_USDC,                   // token
            ACALA_PARACHAIN_ID,          // parachainId
            ACALA_LENDING,               // targetProtocol
            650,                          // 6.5% APY
            2,                            // Low risk (stablecoin LP)
            "Stable LP"                  // strategyType
        );
        console.log("   ✓ Vault 4: Acala - Stable LP (USDC) - 6.5% APY");
    }
    
    function printDeploymentSummary() internal view {
        console.log("\n==================================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("==================================================");
        console.log("Contract Address:", address(aggregator));
        console.log("Vault Count:", aggregator.vaultCount());
        console.log("Total TVL:", aggregator.getTotalTVL());
        console.log("Treasury:", aggregator.treasury());
        console.log("\n📊 Vault Details:");
        
        for (uint256 i = 0; i < aggregator.vaultCount(); i++) {
            CrossChainYieldAggregator.YieldVault memory vault = aggregator.getVaultInfo(i);
            console.log("\n   Vault", i);
            console.log("   - Chain ID:", vault.parachainId);
            console.log("   - APY:", vault.currentAPY, "bps");
            console.log("   - Risk Score:", vault.riskScore);
            console.log("   - Strategy:", vault.strategyType);
        }
    
        console.log("\n📝 Contract Verification Command:");
        console.log("   forge verify-contract", address(aggregator));
        
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.so÷l";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";

// Import our XCM interface
interface IXcm {
    struct Weight {
        uint64 refTime;
        uint64 proofSize;
    }

    function execute(bytes calldata message, Weight calldata weight) external;
    function send(bytes calldata destination, bytes calldata message) external;
    function weighMessage(
        bytes calldata message
    ) external view returns (Weight memory weight);
}

contract CrossChainYieldAggregator is Ownable {
    using SafeERC20 for IERC20;

    // XCM precompile instance
    IXcm public constant XCM = IXcm(address(0xA0000));

    // =============================================================
    //                            STRUCTS
    // =============================================================

    struct YieldVault {
        uint256 vaultId; // Unique vault identifier
        address token; // Asset token address
        uint256 parachainId; // Target parachain (1000=Moonbeam, 2000=Acala, etc)
        address targetProtocol; // Protocol address on target chain
        uint256 currentAPY; // Current yield in basis points (100 = 1%)
        uint256 totalDeposits; // Total deposited in vault
        uint256 totalShares; // Total vault shares issued
        uint256 lastHarvest; // Last harvest timestamp
        uint256 riskScore; // Risk score 1-10 (1=lowest risk)
        bool isActive; // Vault status
        string strategyType; // e.g., "liquid_staking", "lending", "LP"
    }

    struct UserPosition {
        uint256 shares; // User's vault shares
        uint256 depositedAmount; // Original deposit amount
        uint256 lastClaimTime; // Last reward claim
        uint256 pendingRewards; // Unclaimed rewards
    }

    struct XCMPendingOperation {
        uint256 vaultId; // Target vault
        address user; // User address
        uint256 amount; // Operation amount
        uint256 timestamp; // Operation timestamp
        OperationType opType; // Operation type
        OperationStatus status; // Current status
    }

    enum OperationType {
        DEPOSIT,
        WITHDRAW,
        HARVEST,
        REBALANCE
    }

    enum OperationStatus {
        PENDING,
        COMPLETED,
        FAILED
    }

    // =============================================================
    //                            STORAGE
    // =============================================================

    mapping(uint256 => YieldVault) public vaults;
    mapping(uint256 => mapping(address => UserPosition)) public userPositions;
    mapping(bytes32 => XCMPendingOperation) public pendingXCMOps;
    mapping(address => bool) public authorizedStrategists;
    mapping(uint256 => uint256[]) public chainToVaults; // parachainId => vaultIds[]

    uint256 public vaultCount;
    uint256 public totalTVL;

    // Fee structure (in basis points - 100 = 1%)
    uint256 public constant PERFORMANCE_FEE = 200; // 2% (competitive vs market)
    uint256 public constant MANAGEMENT_FEE = 50; // 0.5% annually
    uint256 public constant WITHDRAWAL_FEE = 10; // 0.1%
    uint256 public constant XCM_EXECUTION_FEE = 25; // 0.25% per cross-chain tx
    uint256 public constant MAX_PERFORMANCE_FEE = 500; // 5% maximum

    address public treasury;
    uint256 public lastGlobalHarvest;

    // =============================================================
    //                            EVENTS
    // =============================================================

    event VaultCreated(
        uint256 indexed vaultId,
        address token,
        uint256 parachainId,
        address protocol
    );
    event Deposit(
        address indexed user,
        uint256 indexed vaultId,
        uint256 amount,
        uint256 shares
    );
    event Withdraw(
        address indexed user,
        uint256 indexed vaultId,
        uint256 shares,
        uint256 amount
    );
    event Harvest(uint256 indexed vaultId, uint256 rewards, uint256 newAPY);
    event XCMMessageSent(
        bytes32 indexed messageId,
        uint256 indexed vaultId,
        OperationType opType
    );
    event XCMOperationCompleted(bytes32 indexed messageId, bool success);
    event YieldOptimized(
        uint256 indexed fromVault,
        uint256 indexed toVault,
        uint256 amount
    );
    event FeesCollected(address indexed treasury, uint256 amount);

    // =============================================================
    //                            MODIFIERS
    // =============================================================

    modifier onlyStrategist() {
        require(
            authorizedStrategists[msg.sender] || msg.sender == owner(),
            "Not authorized strategist"
        );
        _;
    }

    modifier validVault(uint256 vaultId) {
        require(
            vaultId < vaultCount && vaults[vaultId].isActive,
            "Invalid or inactive vault"
        );
        _;
    }

    // =============================================================
    //                            CONSTRUCTOR
    // =============================================================

    constructor() Ownable(msg.sender) {
        treasury = msg.sender;
        require(treasury != address(0), "Invalid treasury");
        lastGlobalHarvest = block.timestamp;
    }

    // =============================================================
    //                        VAULT MANAGEMENT
    // =============================================================

    /**
     * @notice Create a new yield vault targeting a specific parachain
     * @param token Asset token address
     * @param parachainId Target parachain ID
     * @param targetProtocol Protocol address on target chain
     * @param initialAPY Initial yield estimate in basis points
     * @param riskScore Risk score 1-10
     * @param strategyType Strategy description
     */
    function createVault(
        address token,
        uint256 parachainId,
        address targetProtocol,
        uint256 initialAPY,
        uint256 riskScore,
        string memory strategyType
    ) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(targetProtocol != address(0), "Invalid protocol");
        require(riskScore >= 1 && riskScore <= 10, "Invalid risk score");
        require(initialAPY <= 50000, "APY too high"); // Max 500%

        uint256 vaultId = vaultCount++;

        vaults[vaultId] = YieldVault({
            vaultId: vaultId,
            token: token,
            parachainId: parachainId,
            targetProtocol: targetProtocol,
            currentAPY: initialAPY,
            totalDeposits: 0,
            totalShares: 0,
            lastHarvest: block.timestamp,
            riskScore: riskScore,
            isActive: true,
            strategyType: strategyType
        });

        chainToVaults[parachainId].push(vaultId);

        emit VaultCreated(vaultId, token, parachainId, targetProtocol);
    }

    // =============================================================
    //                        USER OPERATIONS
    // =============================================================

    /**
     * @notice Deposit tokens into the best available vault
     * @param token Token to deposit
     * @param amount Amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        require(amount > 0, "Amount must be positive");

        // Find best vault for this token
        uint256 bestVaultId = findBestVaultForToken(token);
        require(
            bestVaultId != type(uint256).max,
            "No vault available for token"
        );

        depositToVault(bestVaultId, amount);
    }

    /**
     * @notice Deposit to a specific vault
     * @param vaultId Target vault ID
     * @param amount Amount to deposit
     */
    function depositToVault(
        uint256 vaultId,
        uint256 amount
    ) public validVault(vaultId) {
        YieldVault storage vault = vaults[vaultId];
        IERC20 token = IERC20(vault.token);

        // Transfer tokens from user
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate shares (using simple share calculation for MVP)
        uint256 shares;
        if (vault.totalShares == 0) {
            shares = amount; // 1:1 for first deposit
        } else {
            shares = (amount * vault.totalShares) / vault.totalDeposits;
        }

        // Update storage
        vault.totalDeposits += amount;
        vault.totalShares += shares;
        totalTVL += amount;

        UserPosition storage position = userPositions[vaultId][msg.sender];
        position.shares += shares;
        position.depositedAmount += amount;

        // Execute cross-chain deposit if needed
        if (vault.parachainId != block.chainid) {
            _executeCrossChainDeposit(vaultId, amount);
        }

        emit Deposit(msg.sender, vaultId, amount, shares);
    }

    /**
     * @notice Withdraw from vault
     * @param vaultId Vault to withdraw from
     * @param shares Amount of shares to withdraw
     */
    function withdraw(
        uint256 vaultId,
        uint256 shares
    ) external validVault(vaultId) {
        UserPosition storage position = userPositions[vaultId][msg.sender];
        require(position.shares >= shares, "Insufficient shares");

        YieldVault storage vault = vaults[vaultId];

        // Calculate withdrawal amount
        uint256 amount = (shares * vault.totalDeposits) / vault.totalShares;

        // Apply withdrawal fee
        uint256 fee = (amount * WITHDRAWAL_FEE) / 10000;
        uint256 netAmount = amount - fee;

        // Update storage
        position.shares -= shares;
        vault.totalShares -= shares;
        vault.totalDeposits -= amount;
        totalTVL -= amount;

        // Transfer tokens (simplified for MVP - assume tokens are local)
        IERC20(vault.token).safeTransfer(msg.sender, netAmount);
        if (fee > 0) {
            IERC20(vault.token).safeTransfer(treasury, fee);
            emit FeesCollected(treasury, fee);
        }

        emit Withdraw(msg.sender, vaultId, shares, netAmount);
    }

    // =============================================================
    //                        XCM OPERATIONS
    // =============================================================

    /**
     * @notice Execute cross-chain deposit using XCM
     * @param vaultId Target vault
     * @param amount Amount to deposit
     */
    function _executeCrossChainDeposit(
        uint256 vaultId,
        uint256 amount
    ) internal {
        YieldVault storage vault = vaults[vaultId];

        // Build XCM message for cross-chain deposit
        bytes memory xcmMessage = _buildDepositXCMMessage(
            vault.targetProtocol,
            amount,
            vault.token
        );

        // Get weight estimation
        IXcm.Weight memory weight = XCM.weighMessage(xcmMessage);

        // Build destination for target parachain
        bytes memory destination = _encodeParachainDestination(
            vault.parachainId
        );

        // Send XCM message
        XCM.send(destination, xcmMessage);

        // Track operation
        bytes32 messageId = keccak256(
            abi.encode(xcmMessage, block.timestamp, msg.sender)
        );
        pendingXCMOps[messageId] = XCMPendingOperation({
            vaultId: vaultId,
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            opType: OperationType.DEPOSIT,
            status: OperationStatus.PENDING
        });

        emit XCMMessageSent(messageId, vaultId, OperationType.DEPOSIT);
    }

    /**
     * @notice Build XCM message for depositing to yield protocol
     * @param protocol Target protocol address
     * @param amount Amount to deposit
     * @param token Token address
     */
    function _buildDepositXCMMessage(
        address protocol,
        uint256 amount,
        address token
    ) internal pure returns (bytes memory) {
        // For hackathon: simplified XCM message
        // In production, would use proper SCALE encoding
        return
            abi.encodePacked(
                hex"050c000401000003008c86471301000003008c8647000d010101000000010100",
                protocol,
                amount,
                token
            );
    }

    /**
     * @notice Encode parachain destination for XCM
     * @param parachainId Target parachain ID
     */
    function _encodeParachainDestination(
        uint256 parachainId
    ) internal pure returns (bytes memory) {
        // SCALE encode MultiLocation for parachain
        // Format: { parents: 1, interior: X1(Parachain(parachainId)) }
        return
            abi.encodePacked(
                hex"01", // parents = 1 (go up to relay chain)
                hex"00", // interior = X1
                hex"00", // Parachain variant
                parachainId
            );
    }

    // =============================================================
    //                        YIELD OPTIMIZATION
    // =============================================================

    /**
     * @notice Find best vault for a given token
     * @param token Token address
     * @return vaultId Best vault ID or type(uint256).max if none found
     */
    function findBestVaultForToken(
        address token
    ) public view returns (uint256) {
        uint256 bestVaultId = type(uint256).max;
        uint256 bestScore = 0;

        for (uint256 i = 0; i < vaultCount; i++) {
            YieldVault storage vault = vaults[i];

            if (!vault.isActive || vault.token != token) continue;

            // Calculate risk-adjusted score
            // Higher APY is better, lower risk is better
            uint256 score = (vault.currentAPY * (11 - vault.riskScore)) / 10;

            if (score > bestScore) {
                bestScore = score;
                bestVaultId = i;
            }
        }

        return bestVaultId;
    }

    /**
     * @notice Get best yield opportunities across all chains
     * @param token Token to analyze
     * @return Top 3 vault IDs with best risk-adjusted yields
     */
    function getBestYieldOpportunities(
        address token
    ) external view returns (uint256[3] memory) {
        uint256[3] memory topVaults = [
            type(uint256).max,
            type(uint256).max,
            type(uint256).max
        ];
        uint256[3] memory topScores = [uint256(0), uint256(0), uint256(0)];

        for (uint256 i = 0; i < vaultCount; i++) {
            YieldVault storage vault = vaults[i];

            if (!vault.isActive || vault.token != token) continue;

            uint256 score = (vault.currentAPY * (11 - vault.riskScore)) / 10;

            // Insert into top 3
            for (uint256 j = 0; j < 3; j++) {
                if (score > topScores[j]) {
                    // Shift existing entries down
                    for (uint256 k = 2; k > j; k--) {
                        topScores[k] = topScores[k - 1];
                        topVaults[k] = topVaults[k - 1];
                    }
                    topScores[j] = score;
                    topVaults[j] = i;
                    break;
                }
            }
        }

        return topVaults;
    }

    // =============================================================
    //                        HARVEST & REWARDS
    // =============================================================

    /**
     * @notice Harvest rewards for a specific vault
     * @param vaultId Vault to harvest
     */
    function harvest(
        uint256 vaultId
    ) external onlyStrategist validVault(vaultId) {
        YieldVault storage vault = vaults[vaultId];
        require(
            block.timestamp >= vault.lastHarvest + 1 hours,
            "Too soon to harvest"
        );

        // For MVP: simulate harvest with mock rewards
        uint256 mockRewards = (vault.totalDeposits * vault.currentAPY) /
            10000 /
            365; // Daily rewards

        if (mockRewards > 0) {
            // Performance fee
            uint256 performanceFee = (mockRewards * PERFORMANCE_FEE) / 10000;
            uint256 netRewards = mockRewards - performanceFee;

            // Auto-compound: add rewards to total deposits
            vault.totalDeposits += netRewards;
            totalTVL += netRewards;

            // Send fees to treasury
            if (performanceFee > 0) {
                // In production, would transfer actual tokens
                emit FeesCollected(treasury, performanceFee);
            }
        }

        vault.lastHarvest = block.timestamp;
        emit Harvest(vaultId, mockRewards, vault.currentAPY);
    }

    /**
     * @notice Harvest all active vaults
     */
    function harvestAll() external onlyStrategist {
        for (uint256 i = 0; i < vaultCount; i++) {
            if (
                vaults[i].isActive &&
                block.timestamp >= vaults[i].lastHarvest + 1 hours
            ) {
                this.harvest(i);
            }
        }
        lastGlobalHarvest = block.timestamp;
    }

    // =============================================================
    //                        ADMIN FUNCTIONS
    // =============================================================

    function setStrategist(
        address strategist,
        bool authorized
    ) external onlyOwner {
        authorizedStrategists[strategist] = authorized;
    }

    function updateVaultAPY(
        uint256 vaultId,
        uint256 newAPY
    ) external onlyStrategist validVault(vaultId) {
        require(newAPY <= 50000, "APY too high");
        vaults[vaultId].currentAPY = newAPY;
    }

    function pauseVault(
        uint256 vaultId
    ) external onlyOwner validVault(vaultId) {
        vaults[vaultId].isActive = false;
    }

    // =============================================================
    //                        VIEW FUNCTIONS
    // =============================================================

    function getVaultInfo(
        uint256 vaultId
    ) external view returns (YieldVault memory) {
        return vaults[vaultId];
    }

    function getUserPosition(
        uint256 vaultId,
        address user
    ) external view returns (UserPosition memory) {
        return userPositions[vaultId][user];
    }

    function getTotalTVL() external view returns (uint256) {
        return totalTVL;
    }

    function getVaultsByChain(
        uint256 parachainId
    ) external view returns (uint256[] memory) {
        return chainToVaults[parachainId];
    }
}

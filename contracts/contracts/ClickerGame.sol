// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClickerGame — On-chain clicker with upgrades and leaderboard on Base
/// @notice Clicks are counted off-chain for speed; upgrades and leaderboard are on-chain
contract ClickerGame {
    struct PlayerData {
        uint256 totalClicks;
        uint256 score;
        uint256 clickMultiplier;  // extra multiplier from upgrades (in basis points, 10000 = 1x)
        uint256 autoClickRate;    // auto clicks per second (scaled x100)
        uint64 lastSyncTime;
        bool exists;
    }

    struct Upgrade {
        string name;
        uint256 baseCost;
        uint256 costMultiplier; // cost multiplier per level (in basis points, 15000 = 1.5x)
        uint256 effectValue;    // effect amount per level
        uint8 effectType;       // 0 = click multiplier, 1 = auto click rate, 2 = global multiplier
        uint8 maxLevel;
    }

    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 totalClicks;
    }

    // State
    mapping(address => PlayerData) public players;
    mapping(address => mapping(uint256 => uint8)) public playerUpgradeLevels;
    Upgrade[] public upgrades;
    address[] public leaderboardPlayers;
    mapping(address => bool) private inLeaderboard;

    // Rate limiting: max clicks per sync based on time elapsed
    uint256 public constant MAX_CLICKS_PER_SECOND = 20;
    uint256 public constant MIN_SYNC_INTERVAL = 5; // seconds

    // Events
    event ClicksSynced(address indexed player, uint256 clicks, uint256 newScore);
    event UpgradePurchased(address indexed player, uint256 indexed upgradeId, uint8 newLevel, uint256 cost);

    constructor() {
        // Initialize upgrades
        upgrades.push(Upgrade("Double Click",   100,    15000, 10000, 0, 10));  // +10000 bp per level to click multiplier
        upgrades.push(Upgrade("Auto Clicker",   500,    16000, 100,   1, 10));  // +1/sec auto click (scaled x100)
        upgrades.push(Upgrade("Mega Tap",       2000,   17000, 50000, 0, 5));   // +50000 bp per level (massive click boost)
        upgrades.push(Upgrade("Turbo Auto",     10000,  18000, 1000,  1, 5));   // +10/sec auto click
        upgrades.push(Upgrade("Diamond Hands",  50000,  20000, 5000,  2, 3));   // +5000 bp global multiplier per level
    }

    /// @notice Sync off-chain clicks to the contract
    /// @param newClicks Number of new clicks since last sync
    function syncClicks(uint256 newClicks) external {
        PlayerData storage player = players[msg.sender];
        bool isFirstSync = !player.exists;

        if (isFirstSync) {
            player.exists = true;
            player.clickMultiplier = 10000; // 1x base
            _addToLeaderboard(msg.sender);
        }

        uint256 elapsed;
        if (isFirstSync) {
            // First sync: allow all clicks (no time reference yet)
            elapsed = newClicks; // treat as 1 click per second allowance
        } else {
            elapsed = block.timestamp - player.lastSyncTime;
            require(elapsed >= MIN_SYNC_INTERVAL, "Sync too frequent");
        }

        // Rate limit clicks based on elapsed time (skip for first sync)
        if (!isFirstSync) {
            uint256 maxClicks = elapsed * MAX_CLICKS_PER_SECOND;
            if (newClicks > maxClicks) {
                newClicks = maxClicks;
            }
        }

        // Calculate score from clicks using multiplier
        uint256 clickScore = (newClicks * player.clickMultiplier) / 10000;

        // Calculate auto-click score (only after first sync)
        uint256 autoScore = 0;
        if (!isFirstSync) {
            autoScore = (elapsed * player.autoClickRate) / 100;
        }

        // Apply global multiplier (from Diamond Hands)
        uint256 globalMult = _getGlobalMultiplier(msg.sender);
        uint256 totalScore = ((clickScore + autoScore) * globalMult) / 10000;

        player.totalClicks += newClicks;
        player.score += totalScore;
        player.lastSyncTime = uint64(block.timestamp);

        emit ClicksSynced(msg.sender, newClicks, player.score);
    }

    /// @notice Buy an upgrade using score points
    /// @param upgradeId Index of the upgrade to buy
    function buyUpgrade(uint256 upgradeId) external {
        require(upgradeId < upgrades.length, "Invalid upgrade");
        PlayerData storage player = players[msg.sender];
        require(player.exists, "Play first");

        Upgrade storage upg = upgrades[upgradeId];
        uint8 currentLevel = playerUpgradeLevels[msg.sender][upgradeId];
        require(currentLevel < upg.maxLevel, "Max level reached");

        uint256 cost = getUpgradeCost(upgradeId, currentLevel);
        require(player.score >= cost, "Not enough score");

        player.score -= cost;
        playerUpgradeLevels[msg.sender][upgradeId] = currentLevel + 1;

        // Apply upgrade effect
        if (upg.effectType == 0) {
            player.clickMultiplier += upg.effectValue;
        } else if (upg.effectType == 1) {
            player.autoClickRate += upg.effectValue;
        }
        // effectType 2 (global) is calculated dynamically

        emit UpgradePurchased(msg.sender, upgradeId, currentLevel + 1, cost);
    }

    /// @notice Get cost of next level for an upgrade
    function getUpgradeCost(uint256 upgradeId, uint8 currentLevel) public view returns (uint256) {
        Upgrade storage upg = upgrades[upgradeId];
        uint256 cost = upg.baseCost;
        for (uint8 i = 0; i < currentLevel; i++) {
            cost = (cost * upg.costMultiplier) / 10000;
        }
        return cost;
    }

    /// @notice Get full player data
    function getPlayerData(address addr) external view returns (
        uint256 totalClicks,
        uint256 score,
        uint256 clickMultiplier,
        uint256 autoClickRate,
        uint64 lastSyncTime,
        bool exists
    ) {
        PlayerData storage p = players[addr];
        return (p.totalClicks, p.score, p.clickMultiplier, p.autoClickRate, p.lastSyncTime, p.exists);
    }

    /// @notice Get all upgrade levels for a player
    function getPlayerUpgrades(address addr) external view returns (uint8[] memory) {
        uint8[] memory levels = new uint8[](upgrades.length);
        for (uint256 i = 0; i < upgrades.length; i++) {
            levels[i] = playerUpgradeLevels[addr][i];
        }
        return levels;
    }

    /// @notice Get number of upgrades
    function getUpgradeCount() external view returns (uint256) {
        return upgrades.length;
    }

    /// @notice Get leaderboard (top N players sorted by score, descending)
    function getLeaderboard(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        uint256 count = leaderboardPlayers.length;
        if (limit > count) limit = count;
        if (limit == 0) return new LeaderboardEntry[](0);

        // Build array of all entries
        LeaderboardEntry[] memory all = new LeaderboardEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            address addr = leaderboardPlayers[i];
            PlayerData storage p = players[addr];
            all[i] = LeaderboardEntry(addr, p.score, p.totalClicks);
        }

        // Simple selection sort for top N (gas efficient for small N)
        for (uint256 i = 0; i < limit; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < count; j++) {
                if (all[j].score > all[maxIdx].score) {
                    maxIdx = j;
                }
            }
            if (maxIdx != i) {
                LeaderboardEntry memory tmp = all[i];
                all[i] = all[maxIdx];
                all[maxIdx] = tmp;
            }
        }

        // Copy top N
        LeaderboardEntry[] memory result = new LeaderboardEntry[](limit);
        for (uint256 i = 0; i < limit; i++) {
            result[i] = all[i];
        }
        return result;
    }

    /// @notice Get total number of players
    function getPlayerCount() external view returns (uint256) {
        return leaderboardPlayers.length;
    }

    // --- Internal ---

    function _addToLeaderboard(address addr) private {
        if (!inLeaderboard[addr]) {
            inLeaderboard[addr] = true;
            leaderboardPlayers.push(addr);
        }
    }

    function _getGlobalMultiplier(address addr) private view returns (uint256) {
        uint256 mult = 10000; // base 1x
        for (uint256 i = 0; i < upgrades.length; i++) {
            if (upgrades[i].effectType == 2) {
                mult += upgrades[i].effectValue * playerUpgradeLevels[addr][i];
            }
        }
        return mult;
    }
}

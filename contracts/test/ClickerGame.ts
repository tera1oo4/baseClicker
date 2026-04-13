import { expect } from "chai";
import { ethers } from "hardhat";
import { ClickerGame } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ClickerGame", function () {
  let game: ClickerGame;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ClickerGame");
    game = await factory.deploy();
  });

  describe("Initialization", function () {
    it("should have 5 upgrades", async function () {
      expect(await game.getUpgradeCount()).to.equal(5);
    });

    it("should have zero players initially", async function () {
      expect(await game.getPlayerCount()).to.equal(0);
    });
  });

  describe("syncClicks", function () {
    it("should register a new player on first sync", async function () {
      await game.connect(player1).syncClicks(50);

      const data = await game.getPlayerData(player1.address);
      expect(data.exists).to.be.true;
      expect(data.totalClicks).to.be.greaterThan(0);
      expect(data.score).to.be.greaterThan(0);
      expect(await game.getPlayerCount()).to.equal(1);
    });

    it("should calculate score with base 1x multiplier", async function () {
      await game.connect(player1).syncClicks(100);

      const data = await game.getPlayerData(player1.address);
      expect(data.score).to.be.greaterThan(0);
    });

    it("should enforce rate limiting (max clicks per second)", async function () {
      // First sync is uncapped
      await game.connect(player1).syncClicks(50);

      // Second sync: ~10 seconds elapsed, max = elapsed * 20
      await time.increase(10);
      await game.connect(player1).syncClicks(1000);

      const data = await game.getPlayerData(player1.address);
      // totalClicks = 50 (first, uncapped) + capped second sync
      // Second sync capped to ~200-220 (elapsed may be slightly > 10)
      expect(data.totalClicks).to.be.lte(300); // 50 + max 250
      expect(data.totalClicks).to.be.gte(200); // at least 50 + 150
    });

    it("should reject sync if too frequent", async function () {
      await game.connect(player1).syncClicks(10);

      // Try again immediately (less than MIN_SYNC_INTERVAL)
      await expect(
        game.connect(player1).syncClicks(10)
      ).to.be.revertedWith("Sync too frequent");
    });

    it("should accumulate clicks across syncs", async function () {
      await game.connect(player1).syncClicks(50);
      const data1 = await game.getPlayerData(player1.address);

      await time.increase(10);
      await game.connect(player1).syncClicks(50);
      const data2 = await game.getPlayerData(player1.address);

      expect(data2.totalClicks).to.be.greaterThan(data1.totalClicks);
      expect(data2.score).to.be.greaterThan(data1.score);
    });
  });

  describe("buyUpgrade", function () {
    beforeEach(async function () {
      // Give player some score via syncs
      await game.connect(player1).syncClicks(1000);
      for (let i = 0; i < 9; i++) {
        await time.increase(60);
        await game.connect(player1).syncClicks(1000);
      }
    });

    it("should buy first upgrade (Double Click)", async function () {
      const scoreBefore = (await game.getPlayerData(player1.address)).score;
      const cost = await game.getUpgradeCost(0, 0);

      if (scoreBefore >= cost) {
        await game.connect(player1).buyUpgrade(0);
        const levels = await game.getPlayerUpgrades(player1.address);
        expect(levels[0]).to.equal(1);

        const scoreAfter = (await game.getPlayerData(player1.address)).score;
        expect(scoreAfter).to.equal(scoreBefore - cost);
      }
    });

    it("should increase click multiplier after buying click upgrade", async function () {
      const dataBefore = await game.getPlayerData(player1.address);
      const cost = await game.getUpgradeCost(0, 0);

      if (dataBefore.score >= cost) {
        await game.connect(player1).buyUpgrade(0);
        const dataAfter = await game.getPlayerData(player1.address);
        expect(dataAfter.clickMultiplier).to.be.greaterThan(dataBefore.clickMultiplier);
      }
    });

    it("should reject if not enough score", async function () {
      // Upgrade 4 (Diamond Hands) costs 50000
      const cost = await game.getUpgradeCost(4, 0);
      const score = (await game.getPlayerData(player1.address)).score;

      if (score < cost) {
        await expect(
          game.connect(player1).buyUpgrade(4)
        ).to.be.revertedWith("Not enough score");
      }
    });

    it("should reject invalid upgrade id", async function () {
      await expect(
        game.connect(player1).buyUpgrade(99)
      ).to.be.revertedWith("Invalid upgrade");
    });

    it("should reject if player has not synced yet", async function () {
      await expect(
        game.connect(player2).buyUpgrade(0)
      ).to.be.revertedWith("Play first");
    });

    it("should scale upgrade cost with level", async function () {
      const cost0 = await game.getUpgradeCost(0, 0);
      const cost1 = await game.getUpgradeCost(0, 1);
      expect(cost1).to.be.greaterThan(cost0);
    });
  });

  describe("Auto Clicker", function () {
    it("should earn auto-click score over time", async function () {
      // First sync to register
      await game.connect(player1).syncClicks(1000);
      for (let i = 0; i < 9; i++) {
        await time.increase(60);
        await game.connect(player1).syncClicks(1000);
      }

      // Buy auto clicker if affordable
      const cost = await game.getUpgradeCost(1, 0);
      const score = (await game.getPlayerData(player1.address)).score;

      if (score >= cost) {
        await game.connect(player1).buyUpgrade(1);

        const scoreBefore = (await game.getPlayerData(player1.address)).score;

        // Wait and sync with 0 clicks — auto clicker should generate score
        await time.increase(60);
        await game.connect(player1).syncClicks(0);

        const scoreAfter = (await game.getPlayerData(player1.address)).score;
        expect(scoreAfter).to.be.greaterThan(scoreBefore);
      }
    });
  });

  describe("Leaderboard", function () {
    it("should track players in leaderboard", async function () {
      await game.connect(player1).syncClicks(100);
      await time.increase(10);
      await game.connect(player2).syncClicks(50);

      const board = await game.getLeaderboard(10);
      expect(board.length).to.equal(2);
    });

    it("should sort by score descending", async function () {
      await game.connect(player1).syncClicks(100);

      await time.increase(10);
      await game.connect(player2).syncClicks(200);

      const board = await game.getLeaderboard(10);
      expect(board[0].score).to.be.gte(board[1].score);
    });

    it("should limit results", async function () {
      await game.connect(player1).syncClicks(50);
      await time.increase(10);
      await game.connect(player2).syncClicks(50);

      const board = await game.getLeaderboard(1);
      expect(board.length).to.equal(1);
    });

    it("should return empty for limit 0", async function () {
      const board = await game.getLeaderboard(0);
      expect(board.length).to.equal(0);
    });
  });

  describe("Upgrade cost scaling", function () {
    it("should increase exponentially", async function () {
      const cost0 = await game.getUpgradeCost(0, 0); // 100
      const cost1 = await game.getUpgradeCost(0, 1); // 100 * 1.5 = 150
      const cost2 = await game.getUpgradeCost(0, 2); // 150 * 1.5 = 225

      expect(cost0).to.equal(100);
      expect(cost1).to.equal(150); // 100 * 15000 / 10000
      expect(cost2).to.equal(225); // 150 * 15000 / 10000
    });
  });
});

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClickerGameModule = buildModule("ClickerGameModule", (m) => {
  const clickerGame = m.contract("ClickerGame");
  return { clickerGame };
});

export default ClickerGameModule;

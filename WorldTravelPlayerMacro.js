// 👤 Player Macro: Handles discovery logic per player and awards XP
const sceneId = args?.[0] ?? arguments[0];
console.log("🧭 Macro 2: sceneId =", sceneId);

const targetScene = game.scenes.get(sceneId);
if (!targetScene) {
  ui.notifications.warn("Invalid scene ID.");
  return;
}

const locationName = targetScene.name;
let discovered = game.user.getFlag("world", "discoveredLocations") || [];

if (discovered.includes(locationName)) {
  console.log(`🛑 Already discovered by player: ${locationName}`);
  return;
}

// 🧠 Mark location as discovered
discovered.push(locationName);
await game.user.setFlag("world", "discoveredLocations", discovered);

// 🧙 Award XP to selected actor
const xpAward = 25;
const currentToken = canvas.tokens.controlled[0];
if (!token) {
  ui.notifications.warn("You must select a token to interact with this.");
  return;
}

const currentActor = currentToken.actor;
const currentXP = actor.system.details?.xp?.value ?? 0;
const newXP = currentXP + xpAward;

await currentActor.update({ "system.details.xp.value": newXP });
ui.notifications.info(`You discovered ${locationName}! (+${xpAward} XP)`);
AudioHelper.play({ src: 'modules/svl/Sounds/Discovery.ogg', volume: 1.0 }, true)


// ✅ Tell the GM to update the World Travel journal via socketlib
if (game.modules.get("socketlib")?.active) {
  console.log("📡 Sending GM request to update journal...");
  await socketlib.modules.get("world-travel").executeAsGM("updateWorldTravel", sceneId);
} else {
  console.warn("⚠️ socketlib not active — journal not updated.");
}

// Send notification to players with a message from the GM side
socketlib.register("world-travel", {
  notify: (message) => ui.notifications.info(message)
});
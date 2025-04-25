let worldTravelSocket;

// ✅ Define the function first
async function updateWorldTravel(sceneId) {

  console.log("[World Travel] updateWorldTravel called with sceneId:", sceneId);
  const journalUUID = "JournalEntry.lHQRhRDxVpkASckn"; // Replace with your actual UUID
  const travelJournal = await fromUuid(journalUUID);
  const targetScene = game.scenes.get(sceneId);

  if (!travelJournal) {
    console.error("[World Travel] ❌ Journal not found from UUID.");
    return;
  }

  if (!targetScene) {
    console.error("[World Travel] ❌ Scene not found from sceneId:", sceneId);
    return;
  }

  const locationName = targetScene.name;
  let discovered = travelJournal.getFlag("world", "discoveredLocations") || [];

  if (discovered.includes(locationName)) {
    console.log(`[World Travel] ${locationName} already exists in journal.`);
    return;
  }

  const page = travelJournal.pages.contents[0];
  if (!page) {
    console.error("[World Travel] ❌ No pages found in journal.");
    return;
  } 

  const sceneLink = `@Scene[${targetScene.id}]{${locationName}}`;
  const updatedContent = `${page.text.content}<p>${sceneLink}</p>`;

  await page.update({ "text.content": updatedContent });
  discovered.push(locationName);
  await travelJournal.setFlag("world", "discoveredLocations", discovered);
  //ui.notifications.info(`You discovered ${locationName}! (+25 XP)`);
  await socketlib.modules.get("world-travel").executeForEveryone("notify", `${locationName} added to World Travel.`);
  console.log(`[World Travel] Added ${locationName} to journal.`);
}

// ✅ Now register it once the function is defined
Hooks.once("socketlib.ready", () => {
  worldTravelSocket = socketlib.registerModule("world-travel");
  // Register the GM-only function
  worldTravelSocket.register("updateWorldTravel", updateWorldTravel);

   // Register a function available to all clients
   worldTravelSocket.register("notify", (message) => {
    ui.notifications.info(message);
  });

  console.log("[World Travel] All socketlib function registered.");
});
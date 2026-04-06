import type { Project } from '../types/project';
import { DEFAULT_SYSTEM_PROMPT } from '../types/project';
import type { Character } from '../types/character';
import type { SceneBlock, ChatMessage } from '../types/scene';

// ─── Project IDs ──────────────────────────────────────────────
const PROJECT_1 = 'mock-proj-clockwork-kingdom';
const PROJECT_2 = 'mock-proj-neon-shadows';
const PROJECT_3 = 'mock-proj-last-garden';

// ─── Character IDs ────────────────────────────────────────────
const CHAR_AURELIA = 'mock-char-aurelia';
const CHAR_VEX = 'mock-char-vex';
const CHAR_COGSWORTH = 'mock-char-cogsworth';
const CHAR_VENDOR = 'mock-char-vendor';
const CHAR_GUARD = 'mock-char-guard';
const CHAR_KAI = 'mock-char-kai';
const CHAR_RIVEN = 'mock-char-riven';
const CHAR_ELARA = 'mock-char-elara';
const CHAR_THOMAS = 'mock-char-thomas';
const CHAR_MIRA = 'mock-char-mira';

// ─── Projects ─────────────────────────────────────────────────
export const mockProjects: Project[] = [
  {
    id: PROJECT_1,
    title: 'The Clockwork Kingdom',
    premise:
      'In a realm where all life is sustained by a Great Clockwork mechanism beneath the castle, a young inventor princess discovers the gears are slowing — and the kingdom has only days before everything stops forever.',
    genre: 'fantasy',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: PROJECT_2,
    title: 'Neon Shadows',
    premise:
      'A disgraced detective in a rain-soaked cyberpunk metropolis takes on a missing-persons case that leads her into the underbelly of a corporation selling synthetic memories.',
    genre: 'noir',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: PROJECT_3,
    title: 'The Last Garden',
    premise:
      'After a climate catastrophe leaves most of the world barren, an elderly botanist tends the last living garden on Earth — until a stranger arrives claiming they know where another garden grows.',
    genre: 'drama',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 5,
  },
];

// ─── Characters ───────────────────────────────────────────────
export const mockCharacters: Character[] = [
  // ── Clockwork Kingdom Characters ──
  {
    id: CHAR_AURELIA,
    projectId: PROJECT_1,
    name: 'Princess Aurelia',
    age: '22',
    sex: 'Female',
    other: 'Inventor princess. Golden blonde hair braided with brass gears, warm amber eyes, grease-stained fingertips. Wears a modified royal dress with a leather work apron. Inventive, stubborn, compassionate. Uses mechanical metaphors. Mother disappeared into the Great Clockwork when she was twelve.',
    narrativeDescription: 'Princess Aurelia is not the kind of royal who waits in towers. At twenty-two, she is already the finest mechanic in the Clockwork Kingdom, her fingers perpetually stained with oil and her golden braids threaded with tiny brass gears.\n\nBeneath her inventive brilliance lies a stubborn streak that has put her at odds with the royal council more times than anyone can count. She speaks in quick-witted bursts laced with mechanical metaphors, and her compassion for the common folk of the kingdom is as genuine as her disdain for empty ceremony.\n\nThe disappearance of her mother — the Queen who ventured into the Great Clockwork and never returned — left a wound that drives every gear she turns and every forbidden passage she explores.',
    imagePrompt: 'Portrait of a 22-year-old princess with golden blonde braided hair woven with small brass gears, amber eyes, fair skin with light freckles. Wearing a burgundy corseted top with brass buttons and a leather work apron. Steampunk fantasy style, warm amber lighting, concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#C47B2B',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: CHAR_VEX,
    projectId: PROJECT_1,
    name: 'Lord Vex',
    age: '55',
    sex: 'Male',
    other: 'The kingdom\'s chancellor. Silver-white hair, ice blue eyes, gaunt but imposing frame. Mechanical right hand concealed beneath a velvet glove. Calculating, patient, eloquent, ruthless. Speaks in measured tones and uses silence as a weapon. Rose to power after the Queen\'s disappearance.',
    narrativeDescription: 'Lord Vex is the kind of man who makes a room colder simply by entering it. At fifty-five, his silver-white hair and ice-blue eyes give him the appearance of something carved from winter itself, and his gaunt frame carries an authority that needs no crown.\n\nHis voice never rises above a conversational murmur, yet every sentence lands like a decree. He is calculating and ruthless, patient enough to wait a decade for a plan to ripen. Beneath his velvet glove, a mechanical right hand whirs softly — a secret forged from a piece of the Great Clockwork itself.\n\nOnce the kingdom\'s most trusted advisor, Vex used the chaos of the Queen\'s disappearance to consolidate power, positioning himself as the voice of tradition while quietly dismantling every threat to his control.',
    imagePrompt: 'Portrait of a 55-year-old gaunt imposing nobleman with slicked-back silver-white hair, ice blue eyes, pale porcelain skin, deep scar from left temple to jaw. Wearing a dark high-collared suit with silver gear-shaped cufflinks. Dark fantasy, dramatic chiaroscuro lighting, concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#4A4A5A',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: CHAR_COGSWORTH,
    projectId: PROJECT_1,
    name: 'Master Cogsworth',
    age: '72',
    sex: 'Male',
    other: 'The last true Clockwork Master. Wild white hair, thick round spectacles, hands permanently stained with oil. Wears a patched leather apron and keeps a pocket watch that\'s always 3 minutes fast. Wise, gentle, eccentric, secretive. Speaks in riddles and old proverbs. Father figure to Aurelia. Was the Queen\'s confidant.',
    narrativeDescription: 'Master Cogsworth has forgotten more about clockwork than most engineers will ever learn. At seventy-two, his wild white tufts of hair and oil-stained hands tell the story of a life spent elbow-deep in the kingdom\'s greatest mechanism.\n\nHe speaks in riddles and half-finished proverbs, often trailing off mid-sentence as a thought carries him elsewhere, and he chuckles at things no one else finds funny. Behind those thick round spectacles, however, lies a mind as sharp and dangerous as any gear-tooth — and secrets that powerful forces would kill to possess.\n\nThe old man retreated to his workshop after the Queen vanished, guarding knowledge that could save or doom the kingdom. He watches over Aurelia with the protective tenderness of a father, knowing that the truth he carries will one day shatter her world.',
    imagePrompt: 'Portrait of a 72-year-old eccentric clockmaker with wild white tufty hair, thick round spectacles, ruddy sun-spotted skin. Wearing a patched leather apron over a rumpled linen shirt. Warm cozy workshop background, golden candlelight, fantasy concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#8B6F47',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: CHAR_VENDOR,
    projectId: PROJECT_1,
    name: 'Maeve the Market Vendor',
    age: '40s',
    sex: 'Female',
    other: 'A shrewd, fast-talking merchant who sells clockwork trinkets in the city market. She hears everything and sells information as readily as gear-widgets.',
    narrativeDescription: 'Maeve\'s stall sits behind a curtain of clicking brass beads in the heart of the city market. She is shrewd, fast-talking, and knows every whisper that passes through the cobblestone streets.\n\nTo most customers she sells clockwork trinkets — self-winding music boxes, mechanical flowers that bloom in moonlight. But to those who know to ask, she deals in something far more valuable: information.\n\nNothing happens in the kingdom without Maeve hearing about it first, and her price for silence is always higher than her price for secrets.',
    imagePrompt: 'Portrait of a shrewd middle-aged woman merchant with sharp eyes, standing behind a market stall of clockwork trinkets and brass beads. Steampunk marketplace, warm lantern lighting, fantasy concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#C7657B',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: CHAR_GUARD,
    projectId: PROJECT_1,
    name: 'Captain Brenn',
    age: '45',
    sex: 'Male',
    other: 'Head of the castle guard, loyal to the crown but increasingly conflicted by Lord Vex\'s orders. A quiet man who watches everything.',
    narrativeDescription: 'Captain Brenn has served the crown for twenty years, and every one of them is etched into the lines of his weathered face. He is a quiet man — the kind who watches everything and says almost nothing.\n\nHis loyalty to the kingdom is unshakeable, but that loyalty is being tested daily as Lord Vex\'s orders grow bolder and more troubling. Brenn sees more than he lets on, and the weight of what he knows presses heavier with each passing day.\n\nBeneath the uniform and the silence, a good man is trying to decide how far duty should bend before it breaks.',
    imagePrompt: 'Portrait of a 45-year-old castle guard captain with a weathered face, short-cropped brown hair, steady watchful eyes. Wearing polished armor with clockwork insignia. Castle corridor background, dramatic side lighting, fantasy concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#5A8A5A',
    createdAt: Date.now() - 86400000 * 2,
  },

  // ── Neon Shadows Characters ──
  {
    id: CHAR_KAI,
    projectId: PROJECT_2,
    name: 'Detective Kai Nakamura',
    age: '38',
    sex: 'Female',
    other: 'Japanese-American. Disgraced private investigator. Compact, athletic build. Choppy black bob with a streak of electric blue. Augmented left eye that glows cyan. Tenacious, cynical, perceptive, lonely. Once the youngest detective in Metro PD, framed for evidence tampering. Works out of a noodle bar.',
    narrativeDescription: 'Detective Kai Nakamura hasn\'t carried a badge in three years, but old habits die harder than reputations. At thirty-eight, she works out of a back booth in a noodle bar, taking the cases that the Metro PD has already filed under "not worth the paperwork."\n\nHer augmented left eye — an off-the-books upgrade that lets her read digital signatures — glows faintly cyan in the perpetual neon rain, marking her as something between human and machine. She is tenacious to the point of self-destruction, terse in conversation, and masks everything behind dry, hard-boiled wit.\n\nOnce the youngest detective in the department, she was framed for evidence tampering by someone she trusted. Now she hunts truth in a city built on synthetic lies, driven by the cold certainty that redemption is just one case away.',
    imagePrompt: 'Portrait of a 38-year-old Japanese-American woman detective with a choppy black bob and electric blue streak, one eye glowing faintly cyan. Wearing a weathered leather jacket over a dark turtleneck. Rain-soaked cyberpunk city background, neon reflections, noir concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#5B8FBC',
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: CHAR_RIVEN,
    projectId: PROJECT_2,
    name: 'Riven',
    age: '29',
    sex: 'Non-binary',
    other: 'Mixed South Asian and Northern European. Information broker in the undercity. Lanky build, asymmetric violet undercut, bioluminescent mood-shifting tattoos. Playful, unpredictable, loyal, anxious. Former SynthCorp lab escapee. Runs an underground network from a converted subway car.',
    narrativeDescription: 'Riven is the kind of person who fills a room with chaos and somehow makes it feel safer. At twenty-nine, they run the undercity\'s most reliable information network from a converted subway car, brokering secrets between factions who would rather shoot each other than talk.\n\nTheir bioluminescent tattoos — repurposed SynthCorp technology that shifts color with their emotional state — betray feelings their fast-talking mouth tries to hide. They deflect serious moments with jokes, speak in slang and neologisms, and become unsettlingly quiet when they\'re genuinely sincere.\n\nA former lab subject who escaped SynthCorp\'s memory research program, Riven carries the scars of that captivity in their claustrophobia and the tattoos they can never remove. They owe Kai Nakamura a debt, and in the undercity, debts are the closest thing to loyalty.',
    imagePrompt: 'Portrait of a 29-year-old lanky non-binary person with an asymmetric violet undercut, hazel-gold eyes, warm brown skin, bioluminescent color-shifting tattoos on neck and arms. Wearing an oversized tech-woven hoodie with embedded LEDs. Cyberpunk underground setting, neon glow, concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#9B59B6',
    createdAt: Date.now() - 86400000 * 6,
  },

  // ── The Last Garden Characters ──
  {
    id: CHAR_ELARA,
    projectId: PROJECT_3,
    name: 'Dr. Elara Voss',
    age: '68',
    sex: 'Female',
    other: 'German heritage. Renowned botanist and sole guardian of the last living garden on Earth. Silver-white hair in a loose bun, pale green eyes, weathered fair skin. Patient, resolute, tender, grief-stricken. Talks to her plants and uses Latin names unconsciously. Widow of Dr. Marcus Voss.',
    narrativeDescription: 'Dr. Elara Voss has spent the last decade talking to plants because they are the only things left that listen. At sixty-eight, she tends the last living garden on a barren Earth with the gentle precision of a woman who understands that every leaf is an act of defiance against extinction.\n\nHer silver-white hair escapes its loose bun in wisps, her pale green eyes still carry the sharp focus of the scientist who predicted the collapse decades before it happened, and her hands are perpetually caked with the most precious substance left on the planet: living soil.\n\nShe carries her late husband\'s wedding ring on a chain around her neck and his unfinished work in her memory. The garden was their shared dream — a seed vault built inside a decommissioned university greenhouse. Now it is a cathedral for one, and Elara its last priest.',
    imagePrompt: 'Portrait of a 68-year-old woman botanist with silver-white hair in a loose bun with escaped wisps, pale green eyes, weathered fair skin with deep laugh lines. Wearing a faded floral gardening smock and wide-brimmed straw hat. Lush greenhouse garden background, warm natural lighting, dramatic concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#6B8F71',
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: CHAR_THOMAS,
    projectId: PROJECT_3,
    name: 'Thomas',
    age: '30',
    sex: 'Male',
    other: 'Black, West African features. A wanderer from a northern settlement. Lean, hardened by travel, limp in his right leg. Close-cropped black hair, deep brown skin. Hopeful, secretive, kind, desperate. Carries a hand-drawn map tattooed on his back by his grandmother. Searching for a second garden to save his community and his young daughter Mira.',
    narrativeDescription: 'Thomas arrived at the garden gate with dust in his lungs and a story too desperate to be a lie. At thirty, he has walked farther than most people alive have ever traveled, driven by a fragment of a pre-collapse botanical survey that suggests a second garden exists somewhere in the mountains.\n\nHe is lean and hardened by the road, his deep brown skin weathered by sun and wind, and a limp in his right leg marks the cost of a journey that has taken everything from him except hope. He speaks carefully, like a man accustomed to being disbelieved, but when trust breaks through, his voice falls into a storytelling cadence learned from his grandmother.\n\nOn his back, tattooed in his grandmother\'s sure cartographer\'s hand, is a map of the old world. His daughter Mira waits for him in a northern settlement that survives on dried rations and recycled water. She is seven years old, and she is the reason he keeps walking.',
    imagePrompt: 'Portrait of a 30-year-old Black man with close-cropped hair, deep brown skin, lean weathered face, kind but desperate eyes. Wearing a dusty traveler\'s coat and a patched knapsack. Barren landscape background, warm golden hour lighting, post-apocalyptic drama concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#8B6F47',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: CHAR_MIRA,
    projectId: PROJECT_3,
    name: 'Mira',
    age: '7',
    sex: 'Female',
    other: 'Thomas\'s daughter. She appears only in his stories and a worn photograph he carries. Her existence is his reason for the journey.',
    narrativeDescription: 'Mira exists in this story the way stars exist during the day — unseen but shaping everything. She is seven years old, waiting in a northern settlement that grows colder and hungrier with each passing week.\n\nHer father Thomas carries a worn photograph of her tucked against his chest, and every story he tells about her — her laugh, her stubbornness, the way she names every insect she finds — is a prayer disguised as memory.\n\nShe has never seen a living garden, never touched a green leaf. But if Thomas finds what he is looking for, she will inherit a world worth growing old in.',
    imagePrompt: 'Portrait of a 7-year-old Black girl with bright curious eyes and a hopeful expression, short curly hair. Simple worn clothing. Soft warm lighting against a muted barren background, emotional portrait, concept art.',
    imageUri: null,
    portraitPlaceholderColor: '#C7657B',
    createdAt: Date.now() - 86400000 * 10,
  },
];

// ─── Scene Blocks ─────────────────────────────────────────────
export const mockScenes: SceneBlock[] = [
  // ── Clockwork Kingdom Scenes ──
  {
    id: 'mock-scene-ck-1',
    projectId: PROJECT_1,
    order: 0,
    title: 'The Awakening',
    narration:
      'Deep beneath the castle, in a chamber no one has entered in a decade, Princess Aurelia presses her palm against a dust-covered brass door. The metal hums — warm and alive. Beyond it, she discovers a vast hall of turning gears, each one the size of a cathedral window, spinning in perfect silence. At the center, a single gear has stopped. And on the floor beside it, scratched into the stone in her mother\'s handwriting: "Don\'t let them wind it back."',
    visualPromptMeta: {
      imagePrompt: 'A young woman with golden braided hair and amber eyes stands in a vast underground hall filled with enormous brass gears. She touches a massive brass door that glows warmly. Dust motes float in shafts of amber light. The chamber is cathedral-like in scale. Steampunk fantasy aesthetic.',
      videoPrompt: 'Slow push-in through a massive brass door into a cathedral-sized underground chamber. Giant gears turn silently in amber light. A young woman walks forward in awe, her hand trailing along the mechanisms. Camera circles around her as she discovers a stopped gear at the center.',
      cameraDirection: 'Push-in through doorway, then slow orbit around the protagonist',
      lighting: 'Warm amber light filtering through gear mechanisms, dust motes catching light beams',
      mood: 'Awe, mystery, discovery',
    },
    characterIds: [CHAR_AURELIA],
  },
  {
    id: 'mock-scene-ck-2',
    projectId: PROJECT_1,
    order: 1,
    title: 'The Market of Whispers',
    narration:
      'Disguised in a common cloak, Aurelia slips through the city market at dusk. The vendors hawk their wares — clockwork songbirds, self-winding music boxes, mechanical flowers that bloom in moonlight. She finds Maeve\'s stall tucked behind a curtain of clicking beads. "I need to know what happened ten years ago," Aurelia whispers. Maeve\'s eyes narrow. "That kind of knowledge costs more than coin, Your Highness."',
    visualPromptMeta: {
      imagePrompt: 'A bustling steampunk marketplace at twilight. Vendor stalls display clockwork songbirds, mechanical flowers, and music boxes. A cloaked young woman leans close to speak with a sharp-eyed merchant behind a curtain of brass beads. Warm lantern light, steam rising, cobblestone streets.',
      videoPrompt: 'Tracking shot through a busy steampunk marketplace at dusk. Camera weaves between vendor stalls showing clockwork trinkets. Settles on a cloaked young woman approaching a hidden stall. Close-up of two faces in conspiratorial whispered conversation.',
      cameraDirection: 'Tracking shot through market, settling into medium close-up',
      lighting: 'Warm lantern light, dusk sky with amber and purple tones, steam catching the light',
      mood: 'Intrigue, danger beneath charm',
    },
    characterIds: [CHAR_AURELIA, CHAR_VENDOR],
  },
  {
    id: 'mock-scene-ck-3',
    projectId: PROJECT_1,
    order: 2,
    title: 'The Confrontation',
    narration:
      'The council chamber is silent. Lord Vex stands at the head of the long table, his mechanical hand resting on a stack of decrees. "The princess," he says, his voice soft as velvet, "has been spending time in places she should not." Aurelia meets his gaze without flinching. "And the Lord Chancellor has been making decisions that aren\'t his to make." The councilors shift uncomfortably. Between them, the air crackles with the weight of unspoken truths.',
    visualPromptMeta: {
      imagePrompt: 'A tense confrontation in an ornate council chamber. A tall, gaunt man with silver hair and a mechanical hand stands at the head of a long table, facing a young woman who stands defiant at the other end. Councilors sit frozen between them. Dramatic chiaroscuro lighting. Rich warm wood and brass interior.',
      videoPrompt: 'Slow dolly along the length of a council table. At one end, a silver-haired man with a mechanical hand speaks calmly. At the other, a young woman with amber eyes stares back defiantly. Cut between close-ups of their faces. Councilors shift nervously in their seats.',
      cameraDirection: 'Dolly along table length, alternating close-ups',
      lighting: 'Dramatic chiaroscuro — strong side light from tall windows, deep shadows',
      mood: 'Tension, power struggle, barely contained fury',
    },
    characterIds: [CHAR_AURELIA, CHAR_VEX],
  },
  {
    id: 'mock-scene-ck-4',
    projectId: PROJECT_1,
    order: 3,
    title: 'The Forge',
    narration:
      'Cogsworth\'s workshop smells of oil and old paper. The old man hands Aurelia a cup of tea with shaking hands. "Your mother found the heart of the Clockwork," he says carefully, adjusting his spectacles. "The mechanism isn\'t just keeping the kingdom alive, child. It\'s keeping something asleep." He unfurls a schematic across the workbench — the same design tattooed on his forearm, but complete. At the center, where a gear should be, there is a drawing of something that looks unmistakably like a sleeping face.',
    visualPromptMeta: {
      imagePrompt: 'A cluttered clockmaker\'s workshop filled with gears, tools, and technical drawings. An elderly man with wild white hair and thick spectacles unfurls a large yellowed schematic on a workbench. A young woman leans in to look. Warm candlelight and oil lamp glow. Cozy but filled with secrets.',
      videoPrompt: 'Interior of a warm, cluttered clockmaker\'s workshop. An elderly man carefully unfurls a large schematic on a workbench. Camera slowly pushes in over the young woman\'s shoulder to reveal the drawing. Close-up of the schematic center showing a mysterious sleeping face drawn among gears.',
      cameraDirection: 'Over-the-shoulder push-in to schematic reveal',
      lighting: 'Warm candlelight and oil lamps, intimate golden glow',
      mood: 'Revelation, warmth mixed with dread',
    },
    characterIds: [CHAR_AURELIA, CHAR_COGSWORTH],
  },
  {
    id: 'mock-scene-ck-5',
    projectId: PROJECT_1,
    order: 4,
    title: 'The Reckoning',
    narration:
      'The clock tower shudders. Far below, the Great Clockwork groans like a living thing. Aurelia races up the spiral stairs, her butterfly pendant bouncing against her chest. At the top, Lord Vex stands before the master gear, his mechanical hand fused into an access panel. "I\'m not stopping the clock, Princess," he says without turning. "I\'m waking what sleeps beneath it. Your mother tried to stop me once." The tower lurches. Gears scream. And deep below, something ancient begins to open its eyes.',
    visualPromptMeta: {
      imagePrompt: 'A dramatic scene atop a massive clock tower. An imposing man with a mechanical hand fused into a glowing control panel. A young woman bursts through a doorway behind him. Giant gears grind and shake around them. Lightning-like energy pulses through the mechanism. Epic fantasy climax.',
      videoPrompt: 'Rapid camera movement up a spiral staircase. A young woman bursts onto the tower platform. Reverse angle reveals a silver-haired man with his mechanical hand plugged into glowing machinery. The tower shakes. Gears spin wildly. Camera pulls back to show the massive scale as energy pulses downward through the mechanism.',
      cameraDirection: 'Rapid ascent, dramatic reveal, pull-back to epic scale',
      lighting: 'Electric amber energy pulses, dramatic storm lighting, mechanical sparks',
      mood: 'Climax, urgency, awe, terror',
    },
    characterIds: [CHAR_AURELIA, CHAR_VEX],
  },

  // ── Neon Shadows Scenes ──
  {
    id: 'mock-scene-ns-1',
    projectId: PROJECT_2,
    order: 0,
    title: 'The Noodle Bar',
    narration:
      'Rain hammers the neon-streaked windows of Yuki\'s Noodle Bar. Detective Kai Nakamura sits in the back booth, her augmented eye casting a faint cyan glow over the case file spread before her. The missing person: a SynthCorp researcher who vanished three days ago. No body. No trace. Just a corrupted memory file left on their home terminal. Kai takes a pull of cold coffee. She knows that smell — the smell of a case that\'s going to hurt.',
    visualPromptMeta: {
      imagePrompt: 'A cyberpunk noodle bar at night, rain streaming down neon-lit windows. A woman with a choppy black bob sits in a back booth, one eye glowing faintly cyan. Case files spread before her. Pink, blue, and purple neon reflections. Blade Runner noir atmosphere.',
      videoPrompt: 'Exterior establishing shot of a rainy neon-lit street, camera pushes through the noodle bar window. Interior: a lone woman in a back booth, one eye glowing cyan, studying case files. Rain streaks on the window create moving light patterns across her face.',
      cameraDirection: 'Exterior to interior push-through, settling on medium close-up',
      lighting: 'Neon reflections (pink, blue, purple) through rain-streaked glass, cyan eye glow',
      mood: 'Noir solitude, foreboding',
    },
    characterIds: [CHAR_KAI],
  },
  {
    id: 'mock-scene-ns-2',
    projectId: PROJECT_2,
    order: 1,
    title: 'The Undercity Contact',
    narration:
      'The converted subway car rattles with bass-heavy music. Riven sits cross-legged on a pile of server racks, their bioluminescent tattoos shifting from violet to nervous green as Kai enters. "SynthCorp\'s memory vaults," Riven says, pulling up a holographic blueprint. "That\'s where your researcher went. Nobody comes back from there." Their tattoos pulse red for just a moment. "But I know a way in."',
    visualPromptMeta: {
      imagePrompt: 'Interior of a converted subway car turned into a hacker den. A person with violet hair and glowing bioluminescent tattoos sits cross-legged on server racks, displaying a holographic blueprint. Another woman stands in the doorway. Cluttered tech equipment, warm LED strips, underground cyberpunk aesthetic.',
      videoPrompt: 'Camera follows a woman descending into a subway entrance. Interior reveal of a converted subway car filled with tech. A figure with glowing color-shifting tattoos activates a holographic display. Close-up of the holographic blueprint rotating in air between them.',
      cameraDirection: 'Descent sequence, interior reveal, holographic focus',
      lighting: 'Bioluminescent tattoo glow, warm LED strips, holographic blue light',
      mood: 'Underground resistance, nervous energy, conspiracy',
    },
    characterIds: [CHAR_KAI, CHAR_RIVEN],
  },
  {
    id: 'mock-scene-ns-3',
    projectId: PROJECT_2,
    order: 2,
    title: 'The Memory Vault',
    narration:
      'The SynthCorp memory vault is a cathedral of glass tubes, each one containing a swirling cloud of light — synthetic memories preserved in electromagnetic suspension. Kai moves between the rows, her augmented eye scanning for the researcher\'s signature. She finds it. But the memory stored here isn\'t theirs — it\'s hers. A perfect reconstruction of the night she was framed. Someone has been watching her for years.',
    visualPromptMeta: {
      imagePrompt: 'A vast corporate vault filled with rows of tall glass tubes containing swirling luminescent clouds — synthetic memories. A lone woman walks between the rows, one eye glowing cyan. She stares at one tube in shock. Sterile white and blue lighting with warm memory clouds. Cathedral-like scale.',
      videoPrompt: 'Slow tracking shot through rows of glass memory tubes. Camera follows a woman as she scans the tubes. She stops. Close-up of her shocked face reflected in a glass tube. Reverse angle showing the swirling memory cloud inside taking the shape of a familiar scene.',
      cameraDirection: 'Tracking through rows, stop on discovery, reflection close-up',
      lighting: 'Sterile blue-white ambient, warm swirling luminescence inside tubes',
      mood: 'Paranoia, violation, revelation',
    },
    characterIds: [CHAR_KAI],
  },

  // ── The Last Garden Scenes ──
  {
    id: 'mock-scene-lg-1',
    projectId: PROJECT_3,
    order: 0,
    title: 'Morning Ritual',
    narration:
      'Elara rises before the sun, as she has every day for the past twelve years. The greenhouse dome is fogged with condensation, the air thick and green and alive. She moves between the beds with practiced tenderness — checking moisture levels, whispering to seedlings, trimming dead leaves with scissors worn thin from use. Outside the dome, the world is brown and cracked to the horizon. In here, there is still color.',
    visualPromptMeta: {
      imagePrompt: 'An elderly woman in a floral gardening smock tends to lush green plants inside a large greenhouse dome. Condensation on the glass. Early morning golden light. Outside the dome: a barren, cracked brown landscape stretches to the horizon. Contrast of life inside and desolation outside.',
      videoPrompt: 'Pre-dawn exterior of a greenhouse dome in a barren wasteland. Interior: golden morning light filters through condensation as an elderly woman moves between plant beds. Close-up of gentle hands tending seedlings. Wide shot showing the contrast between the lush interior and dead exterior.',
      cameraDirection: 'Exterior establishing, interior golden light, close-ups of hands and plants',
      lighting: 'Golden morning light through condensation, warm and soft, harsh dry light outside',
      mood: 'Tender solitude, quiet defiance',
    },
    characterIds: [CHAR_ELARA],
  },
  {
    id: 'mock-scene-lg-2',
    projectId: PROJECT_3,
    order: 1,
    title: 'The Stranger Arrives',
    narration:
      'She sees him from the observation platform — a figure on the horizon, moving slowly, favoring one leg. By the time he reaches the outer fence, she has her rifle ready. People have come before, wanting to take what grows. But when he collapses at the gate, what falls from his pack is not a weapon. It\'s a seedling — alive, green, and completely impossible. "Please," he whispers. "I\'m not here to take. I\'m here because there\'s another one."',
    visualPromptMeta: {
      imagePrompt: 'A vast barren landscape. A lone traveler with a limp approaches a fenced greenhouse dome. He collapses at the gate. A green seedling spills from his pack onto cracked earth. An elderly woman watches from behind the fence, rifle in hand but lowered. Harsh sunlight, dusty wind, a single point of green.',
      videoPrompt: 'Wide shot of a barren landscape with a lone figure limping toward a greenhouse dome. Camera follows his approach. At the gate, he falls. A green seedling rolls from his pack. Cut to the woman\'s face — suspicion shifting to wonder. Close-up of the impossible living seedling on dead earth.',
      cameraDirection: 'Wide to medium approach, collapse, close-up sequence',
      lighting: 'Harsh, bleached sunlight. The seedling seems to glow with its own soft green light',
      mood: 'Exhaustion, suspicion, fragile hope',
    },
    characterIds: [CHAR_ELARA, CHAR_THOMAS],
  },
  {
    id: 'mock-scene-lg-3',
    projectId: PROJECT_3,
    order: 2,
    title: 'Stories by Lamplight',
    narration:
      'Over a dinner of garden vegetables — the richest meal Thomas has had in months — Elara listens. He tells her about his settlement, about his daughter Mira who has never seen a flower in person, about the fragments of the old botanical survey. He shows her the map on his back, turning so she can trace the route his grandmother charted decades ago. "There," he points to a mountain range in the east. "The survey says there was a second facility. If the seeds survived..."',
    visualPromptMeta: {
      imagePrompt: 'Inside a warm greenhouse living quarters. An elderly woman and a young man sit at a small table covered with vegetables and a simple meal. Lamplight. He turns to show a detailed map tattooed across his back and shoulders. She traces the lines with her finger. Intimate, warm, full of quiet emotion.',
      videoPrompt: 'Interior evening scene. Two people share a simple meal by lamplight inside a greenhouse. Close-up of hands passing food. The man turns to reveal an intricate map tattoo on his back. The woman\'s finger slowly traces a route on his skin. Close-up of her face — tears she won\'t let fall.',
      cameraDirection: 'Intimate medium shots, close-up of the map tattoo, emotional face close-up',
      lighting: 'Warm oil lamp light, soft shadows, golden tones',
      mood: 'Hope kindling, vulnerability, connection',
    },
    characterIds: [CHAR_ELARA, CHAR_THOMAS],
  },
  {
    id: 'mock-scene-lg-4',
    projectId: PROJECT_3,
    order: 3,
    title: 'The Decision',
    narration:
      'Elara stands in the garden at dawn, her husband\'s ring warm against her chest. Outside, Thomas is preparing his pack by the gate. She has given him seeds, water, and everything she can spare. But he hasn\'t asked her to come. He wouldn\'t. She looks at the garden — twelve years of her life, her husband\'s legacy, the last green place. Then she looks at the horizon, where maybe, just maybe, there\'s another. She picks up her hat and her pruning shears. "You\'ll need someone who knows what they\'re looking at," she says.',
    visualPromptMeta: {
      imagePrompt: 'Dawn at the greenhouse. An elderly woman stands among her garden plants, one hand touching a ring on a chain at her neck. Through the glass dome, a young man is visible at the gate preparing a pack. She holds a pruning shears and a straw hat, her expression resolving from grief to determination. First light of dawn breaking over the barren horizon.',
      videoPrompt: 'Sunrise over a barren landscape. Inside the greenhouse, an elderly woman looks at her garden, then through the glass at the traveler preparing to leave. She touches the ring at her neck. Time-lapse of her gathering supplies, picking up her hat and tools. She steps outside the dome for the first time — wide shot of two figures walking toward the horizon together.',
      cameraDirection: 'Interior contemplation, exterior wide shot of departure',
      lighting: 'Dawn breaking — warm gold cutting through cool pre-dawn blue',
      mood: 'Bittersweet resolve, hope triumphing over fear',
    },
    characterIds: [CHAR_ELARA, CHAR_THOMAS],
  },
];

// ─── Chat Messages ────────────────────────────────────────────
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'mock-chat-1',
    projectId: PROJECT_1,
    role: 'user',
    content: 'I want the opening scene to feel like the player is discovering something forbidden. The princess should feel a mix of excitement and dread.',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 3,
  },
  {
    id: 'mock-chat-2',
    projectId: PROJECT_1,
    role: 'assistant',
    content: 'Great instinct! For that forbidden-discovery feel, consider starting with a sensory detail before the visual reveal — the brass door humming warm under her palm, the smell of ancient machine oil. The dread can come from the silence: the gears should be turning, but one isn\'t. And then the mother\'s handwriting on the floor is your emotional gut-punch. It tells the audience: someone was here before, and it didn\'t end well.',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 3 + 60000,
  },
  {
    id: 'mock-chat-3',
    projectId: PROJECT_1,
    role: 'user',
    content: 'What if the clockwork mechanism is actually keeping something alive — or asleep? And Lord Vex wants to wake it?',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 2,
  },
  {
    id: 'mock-chat-4',
    projectId: PROJECT_1,
    role: 'assistant',
    content: 'That\'s a brilliant escalation! It transforms the Clockwork from infrastructure into a prison. The twist layers perfectly: Act 1 — "the clock is breaking, we need to fix it." Act 2 — "the clock was built to contain something." Act 3 — "Vex doesn\'t want to stop the clock, he wants what\'s inside." Each revelation reframes everything the audience thought they knew.',
    timestamp: Date.now() - 86400000 * 2 - 3600000 * 2 + 60000,
  },
  {
    id: 'mock-chat-5',
    projectId: PROJECT_1,
    role: 'user',
    content: 'Should Cogsworth know the full truth from the beginning, or should he be discovering things alongside Aurelia?',
    timestamp: Date.now() - 86400000 - 3600000 * 5,
  },
  {
    id: 'mock-chat-6',
    projectId: PROJECT_1,
    role: 'assistant',
    content: 'I\'d suggest a middle ground — Cogsworth knows the dangerous truth (that the Clockwork contains something) but not the complete picture (what it is, or exactly what happened to the Queen). This way he\'s genuinely helpful but also genuinely scared. His knowledge makes him a target for Vex. And his gaps in understanding give Aurelia moments to surpass her mentor, which is a satisfying character arc.',
    timestamp: Date.now() - 86400000 - 3600000 * 5 + 60000,
  },
  {
    id: 'mock-chat-7',
    projectId: PROJECT_1,
    role: 'user',
    content: 'I love the idea of Vex\'s mechanical hand being made from a piece of the Clockwork. Could that be why he can interface with it?',
    timestamp: Date.now() - 86400000 - 3600000 * 2,
  },
  {
    id: 'mock-chat-8',
    projectId: PROJECT_1,
    role: 'assistant',
    content: 'Perfect! It creates a body-horror element in a fantasy setting — Vex literally grafted ancient power onto himself. It also sets up a visual storytelling beat: when his glove comes off in the final confrontation, the audience sees what he\'s become. And it raises a question: what did it cost him? Maybe the hand is slowly taking over. Maybe that\'s why he\'s desperate to wake what\'s below — he\'s running out of time himself.',
    timestamp: Date.now() - 86400000 - 3600000 * 2 + 60000,
  },
];

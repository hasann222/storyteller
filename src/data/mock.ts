import type { Project } from '../types/project';
import type { Character, PrimaryCharacter, BackgroundCharacter } from '../types/character';
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
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: PROJECT_2,
    title: 'Neon Shadows',
    premise:
      'A disgraced detective in a rain-soaked cyberpunk metropolis takes on a missing-persons case that leads her into the underbelly of a corporation selling synthetic memories.',
    genre: 'noir',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: PROJECT_3,
    title: 'The Last Garden',
    premise:
      'After a climate catastrophe leaves most of the world barren, an elderly botanist tends the last living garden on Earth — until a stranger arrives claiming they know where another garden grows.',
    genre: 'drama',
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
    type: 'primary',
    role: 'protagonist',
    appearance: {
      age: '22',
      gender: 'Female',
      ethnicity: 'Fair-skinned, European features',
      height: '5\'7"',
      build: 'Slender but strong from working with tools',
      hairColor: 'Golden blonde',
      hairStyle: 'Long, usually braided and pinned up with small brass gears woven in',
      eyeColor: 'Warm amber',
      skinTone: 'Fair with light freckles across the nose',
      distinguishingFeatures: 'Grease-stained fingertips, a small clockwork butterfly pendant, a thin scar on her left palm from an early experiment',
      clothing: 'A modified royal dress — corseted top in deep burgundy with brass buttons, leather work apron over a flowing amber skirt, fingerless gloves',
    },
    personality: {
      traits: ['Inventive', 'Stubborn', 'Compassionate', 'Curious'],
      motivations: 'Prove that innovation and tradition can coexist. Save her kingdom without sacrificing the independence she craves.',
      fears: 'Being forced into a purely ceremonial role. Losing Cogsworth, her mentor and only true ally in the castle.',
      voice: 'Quick-witted, occasionally sarcastic, but warm with people she trusts. Uses mechanical metaphors.',
    },
    backstory:
      'Aurelia was raised in the castle but spent more time in the workshops than the throne room. Her mother, the Queen, disappeared when she was twelve — rumored to have ventured below the castle to the Great Clockwork and never returned. This event ignited Aurelia\'s obsession with understanding the mechanism.',
    relationships: 'Mentored by Cogsworth. Adversarial tension with Lord Vex, who controls the council. The castle guards are wary of her unconventional ways.',
    notes: 'Her clockwork butterfly pendant was her mother\'s last gift. It contains a hidden compartment.',
    portraitPlaceholderColor: '#C47B2B',
    createdAt: Date.now() - 86400000 * 3,
  } as PrimaryCharacter,
  {
    id: CHAR_VEX,
    projectId: PROJECT_1,
    name: 'Lord Vex',
    type: 'primary',
    role: 'antagonist',
    appearance: {
      age: '55',
      gender: 'Male',
      ethnicity: 'Pale, angular features',
      height: '6\'1"',
      build: 'Gaunt but imposing',
      hairColor: 'Silver-white',
      hairStyle: 'Slicked back, severe',
      eyeColor: 'Ice blue',
      skinTone: 'Pale, almost porcelain',
      distinguishingFeatures: 'A deep scar running from his left temple to his jaw. A mechanical right hand concealed beneath a velvet glove.',
      clothing: 'Impeccable dark suits with high collars, silver cufflinks shaped like interlocking gears, a black overcoat with subtle clockwork embroidery',
    },
    personality: {
      traits: ['Calculating', 'Patient', 'Eloquent', 'Ruthless'],
      motivations: 'Control the Great Clockwork to reshape the kingdom in his vision. Believes the old ways are superior and progress is dangerous.',
      fears: 'Losing control. The truth about the Queen\'s disappearance being revealed.',
      voice: 'Measured, formal, never raises his voice. Uses silence as a weapon. Every sentence feels like it has a hidden meaning.',
    },
    backstory:
      'Once the kingdom\'s most trusted advisor, Vex rose to power during the chaos of the Queen\'s disappearance. He has silently consolidated control over the council for a decade, positioning himself as the reasonable voice of tradition while quietly sabotaging reformers.',
    relationships: 'Despises Aurelia\'s independence. Has a complicated history with Cogsworth — they were once friends. Feared by the court.',
    notes: 'His mechanical hand is key to the plot — it was made from a piece of the Great Clockwork itself.',
    portraitPlaceholderColor: '#4A4A5A',
    createdAt: Date.now() - 86400000 * 3,
  } as PrimaryCharacter,
  {
    id: CHAR_COGSWORTH,
    projectId: PROJECT_1,
    name: 'Master Cogsworth',
    type: 'primary',
    role: 'mentor',
    appearance: {
      age: '72',
      gender: 'Male',
      ethnicity: 'Weathered, warm-toned skin',
      height: '5\'6"',
      build: 'Stooped, wiry',
      hairColor: 'White with a few remaining streaks of copper',
      hairStyle: 'Wild, untamed tufts sticking out at angles',
      eyeColor: 'Warm brown, magnified by thick round spectacles',
      skinTone: 'Ruddy and sun-spotted',
      distinguishingFeatures: 'A hearing trumpet he pretends not to need. Hands are permanently stained with oil. A tattoo of the Great Clockwork schematic on his forearm.',
      clothing: 'A patched leather apron over a rumpled linen shirt, corduroy trousers with tool loops, a pocket watch chain (the watch is always 3 minutes fast)',
    },
    personality: {
      traits: ['Wise', 'Gentle', 'Eccentric', 'Secretive'],
      motivations: 'Protect Aurelia and guide her to the truth about the Clockwork — and her mother — before it\'s too late.',
      fears: 'That his secrets will endanger Aurelia. That Vex will reach the heart of the Clockwork first.',
      voice: 'Speaks in riddles and old proverbs. Often trails off mid-sentence when a thought takes him elsewhere. Chuckles at things no one else finds funny.',
    },
    backstory:
      'The last true Clockwork Master. He was the Queen\'s confidant and helped her discover the truth about the mechanism. After she disappeared, he retreated to his workshop, guarding knowledge that powerful forces want suppressed.',
    relationships: 'Father figure to Aurelia. Once close friends with Vex — their falling out is one of the story\'s mysteries.',
    notes: 'His workshop contains a hidden passage to the upper levels of the Great Clockwork.',
    portraitPlaceholderColor: '#8B6F47',
    createdAt: Date.now() - 86400000 * 3,
  } as PrimaryCharacter,
  {
    id: CHAR_VENDOR,
    projectId: PROJECT_1,
    name: 'Maeve the Market Vendor',
    type: 'background',
    briefDescription: 'A shrewd, fast-talking merchant who sells clockwork trinkets in the city market. She hears everything and sells information as readily as gear-widgets.',
    createdAt: Date.now() - 86400000 * 2,
  } as BackgroundCharacter,
  {
    id: CHAR_GUARD,
    projectId: PROJECT_1,
    name: 'Captain Brenn',
    type: 'background',
    briefDescription: 'Head of the castle guard, loyal to the crown but increasingly conflicted by Lord Vex\'s orders. A quiet man who watches everything.',
    createdAt: Date.now() - 86400000 * 2,
  } as BackgroundCharacter,

  // ── Neon Shadows Characters ──
  {
    id: CHAR_KAI,
    projectId: PROJECT_2,
    name: 'Detective Kai Nakamura',
    type: 'primary',
    role: 'protagonist',
    appearance: {
      age: '38',
      gender: 'Female',
      ethnicity: 'Japanese-American',
      height: '5\'5"',
      build: 'Compact, athletic',
      hairColor: 'Black with a single streak of electric blue',
      hairStyle: 'Choppy bob, often pushed behind one ear',
      eyeColor: 'Dark brown, almost black',
      skinTone: 'Olive',
      distinguishingFeatures: 'Augmented left eye (glows faintly cyan in low light). A network of faded scars on her knuckles.',
      clothing: 'A weathered leather jacket over a dark turtleneck, tactical boots, a holographic badge she keeps in her pocket rather than on display',
    },
    personality: {
      traits: ['Tenacious', 'Cynical', 'Perceptive', 'Lonely'],
      motivations: 'Find redemption by solving cases the system has abandoned. Uncover who framed her and destroyed her career.',
      fears: 'Trusting the wrong person again. That the synthetic memory tech could overwrite who she really is.',
      voice: 'Terse, dry humor. Narrates her observations like a hard-boiled novel. Rarely speaks about feelings directly.',
    },
    backstory: 'Once the youngest detective in the Metro PD, Kai was framed for evidence tampering by someone inside the department. Stripped of her badge and blacklisted, she now works as a private investigator operating out of a noodle bar.',
    relationships: 'Estranged from her former partner. Has an uneasy alliance with Riven, an information broker.',
    notes: 'Her augmented eye was an off-the-books upgrade — it lets her see digital signatures but causes migraines.',
    portraitPlaceholderColor: '#5B8FBC',
    createdAt: Date.now() - 86400000 * 6,
  } as PrimaryCharacter,
  {
    id: CHAR_RIVEN,
    projectId: PROJECT_2,
    name: 'Riven',
    type: 'primary',
    role: 'ally',
    appearance: {
      age: '29',
      gender: 'Non-binary',
      ethnicity: 'Mixed — South Asian and Northern European',
      height: '5\'10"',
      build: 'Lanky',
      hairColor: 'Shaved sides, top dyed violet',
      hairStyle: 'Asymmetric undercut swept to one side',
      eyeColor: 'Hazel with gold flecks',
      skinTone: 'Warm brown',
      distinguishingFeatures: 'Bioluminescent tattoos that shift color with mood. Multiple ear piercings connected by fine chains.',
      clothing: 'Oversized tech-woven hoodie with embedded LEDs, slim cargo pants, custom sneakers with transparent soles revealing circuitry',
    },
    personality: {
      traits: ['Playful', 'Unpredictable', 'Loyal', 'Anxious'],
      motivations: 'Freedom from the corporate surveillance state. Protecting the people in the undercity who have nobody else.',
      fears: 'Being captured and having their memories extracted. Claustrophobic spaces.',
      voice: 'Fast-talking, uses slang and neologisms. Deflects serious moments with jokes. When genuinely sincere, becomes very quiet.',
    },
    backstory: 'A former corporate lab rat who escaped SynthCorp\'s memory research program. Now runs an underground information network from a converted subway car.',
    relationships: 'Owes Kai a debt from a past case. Has contacts throughout the undercity. Terrified of SynthCorp operatives.',
    notes: 'The bioluminescent tattoos are actually repurposed SynthCorp tech — they react to emotional states involuntarily.',
    portraitPlaceholderColor: '#9B59B6',
    createdAt: Date.now() - 86400000 * 6,
  } as PrimaryCharacter,

  // ── The Last Garden Characters ──
  {
    id: CHAR_ELARA,
    projectId: PROJECT_3,
    name: 'Dr. Elara Voss',
    type: 'primary',
    role: 'protagonist',
    appearance: {
      age: '68',
      gender: 'Female',
      ethnicity: 'German heritage',
      height: '5\'4"',
      build: 'Slight, moves carefully',
      hairColor: 'Silver-white',
      hairStyle: 'Tied in a loose bun with escaped wisps',
      eyeColor: 'Pale green',
      skinTone: 'Weathered fair skin with deep laugh lines',
      distinguishingFeatures: 'Hands perpetually caked with soil. Wears her late husband\'s wedding ring on a chain around her neck.',
      clothing: 'A faded floral gardening smock, sturdy boots, a wide-brimmed straw hat against the harsh sun, reading glasses perched on her head',
    },
    personality: {
      traits: ['Patient', 'Resolute', 'Tender', 'Grief-stricken'],
      motivations: 'Preserve the last green things on Earth. Honor her husband\'s legacy. Pass her knowledge on before it\'s too late.',
      fears: 'That the garden will die with her. That hope itself is a cruelty in a dying world.',
      voice: 'Soft-spoken, precise — a scientist who talks to her plants. Uses Latin plant names unconsciously. Can be sharply funny when she lets her guard down.',
    },
    backstory: 'A renowned botanist who predicted the ecological collapse decades before it happened. She and her husband built the garden as a seed vault. After his death, she became its sole guardian.',
    relationships: 'Widow of Dr. Marcus Voss. Mistrusts outsiders. The garden is her only remaining connection to her past life.',
    notes: 'The garden is built inside the shell of a decommissioned greenhouse that was once part of a university.',
    portraitPlaceholderColor: '#6B8F71',
    createdAt: Date.now() - 86400000 * 12,
  } as PrimaryCharacter,
  {
    id: CHAR_THOMAS,
    projectId: PROJECT_3,
    name: 'Thomas',
    type: 'primary',
    role: 'ally',
    appearance: {
      age: '30',
      gender: 'Male',
      ethnicity: 'Black, West African features',
      height: '6\'0"',
      build: 'Lean, hardened by travel',
      hairColor: 'Black',
      hairStyle: 'Close-cropped',
      eyeColor: 'Dark brown',
      skinTone: 'Deep brown',
      distinguishingFeatures: 'A hand-drawn map tattooed across his back and shoulders. A limp in his right leg.',
      clothing: 'A dusty traveler\'s coat, worn hiking boots, a knapsack held together with patches and wire',
    },
    personality: {
      traits: ['Hopeful', 'Secretive', 'Kind', 'Desperate'],
      motivations: 'Find the second garden to save his community in the north. He believes connection between the gardens could restart the cycle.',
      fears: 'That the second garden is just a rumor. That Elara will refuse to help.',
      voice: 'Earnest, careful with words. Speaks like someone used to being disbelieved. Occasionally slips into a storytelling cadence learned from his grandmother.',
    },
    backstory: 'A wanderer from a northern settlement that survives on dried rations and recycled water. He found fragments of a pre-collapse botanical survey suggesting a second garden exists in the mountains.',
    relationships: 'Arrives as a stranger to Elara. Carries the hopes of an entire community. Has a young daughter waiting for him back north.',
    notes: 'The map on his back was tattooed by his grandmother, who was a cartographer before the collapse.',
    portraitPlaceholderColor: '#8B6F47',
    createdAt: Date.now() - 86400000 * 10,
  } as PrimaryCharacter,
  {
    id: CHAR_MIRA,
    projectId: PROJECT_3,
    name: 'Mira',
    type: 'background',
    briefDescription: 'Thomas\'s seven-year-old daughter. She appears only in his stories and a worn photograph he carries. Her existence is his reason for the journey.',
    createdAt: Date.now() - 86400000 * 10,
  } as BackgroundCharacter,
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

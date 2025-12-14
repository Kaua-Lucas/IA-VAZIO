const swords = [
    'netherite_sword',
    'diamond_sword',
    'iron_sword',
    'stone_sword',
    'golden_sword',
    'wooden_sword'
];

const ferramentasBlocos = {
    pickaxe: [
      "stone", "ore", "deepslate", "obsidian", "andesite", "granite", "diorite",
      "netherrack", "blackstone", "basalt", "glass", "ice", "packed_ice", "blue_ice",
      "glass_pane", "stained_glass", "cobblestone", "stone_bricks", "bricks",
      "sandstone", "red_sandstone", "nether_bricks", "quartz_block", "purpur_block",
      "end_stone", "terracotta", "glazed_terracotta", "netherite_block",
      "ancient_debris", "gold_block", "diamond_block", "iron_block", "emerald_block",
      "lapis_block", "copper_block", "amethyst_block"
    ],
    axe: [
      "log", "wood", "planks", "stem", "hyphae", "bamboo", "crimson_fungus",
      "warped_fungus"
    ],
    shovel: [
      "dirt", "grass", "sand", "gravel", "clay", "soul_sand", "soul_soil", "mud",
      "snow_block", "mycelium", "podzol", "rooted_dirt"
    ],
    shears: [
      "leaves", "vine", "seagrass", "kelp", "cobweb", "hay_block", "bamboo", "melon",
      "pumpkin", "wool", "carpet"
    ],
    hoe: [
      "nether_wart_block", "wart_block", "mushroom_block"
    ]
  };

  // --- LISTA DE ARMADURAS ---
  // Adicionadas todas as armaduras de jogador
  const armor = [
    // Leather
    'leather_helmet',
    'leather_chestplate',
    'leather_leggings',
    'leather_boots',

    // Chainmail
    'chainmail_helmet',
    'chainmail_chestplate',
    'chainmail_leggings',
    'chainmail_boots',

    // Iron
    'iron_helmet',
    'iron_chestplate',
    'iron_leggings',
    'iron_boots',

    // Gold
    'golden_helmet',
    'golden_chestplate',
    'golden_leggings',
    'golden_boots',

    // Diamond
    'diamond_helmet',
    'diamond_chestplate',
    'diamond_leggings',
    'diamond_boots',

    // Netherite
    'netherite_helmet',
    'netherite_chestplate',
    'netherite_leggings',
    'netherite_boots',

    // Especiais
    'turtle_shell', // Conta como capacete (helmet)
    'elytra'        // Conta como peitoral (chestplate)
  ];

module.exports = { swords, ferramentasBlocos, armor}
const React = require('react');

/**
 * Minimal mock for @expo/vector-icons and its sub-path exports.
 * Maps both:
 *   import MCI from '@expo/vector-icons/MaterialCommunityIcons'
 *   import { Ionicons } from '@expo/vector-icons'
 */
const MockIcon = () => null;

// Default export (handles sub-path imports like /MaterialCommunityIcons)
module.exports = MockIcon;

// Named exports (handles destructured imports from the root package)
module.exports.default = MockIcon;
module.exports.MaterialCommunityIcons = MockIcon;
module.exports.Ionicons = MockIcon;
module.exports.FontAwesome = MockIcon;
module.exports.MaterialIcons = MockIcon;
module.exports.Feather = MockIcon;
module.exports.AntDesign = MockIcon;
module.exports.Entypo = MockIcon;
module.exports.EvilIcons = MockIcon;
module.exports.Foundation = MockIcon;
module.exports.Octicons = MockIcon;
module.exports.SimpleLineIcons = MockIcon;
module.exports.Zocial = MockIcon;

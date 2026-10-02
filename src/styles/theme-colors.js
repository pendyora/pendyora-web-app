// Single source of truth for the brand palette.
// Consumed by tailwind.config.js (as theme colors) and by antd ConfigProvider tokens in components.
module.exports = {
  primary: '#111111',
  secondary: '#C9AE8A',
  text_w: '#ffffff',
  text: '#111111',
  ivory: '#FAF9F6',
  cream: '#F8F4EE',
  section: '#F1E9DE',
  luxury: '#C9AE8A',
  mocha: '#8B7355',

  // Editorial palette (product listing redesign)
  paper: '#FCFBF9', // page ground
  stone: { DEFAULT: '#ECEAE6', deep: '#E3E0DA' }, // product tiles: cool grey so gold reads warm
  ink: { DEFAULT: '#17140F', soft: '#6B645A', hover: '#2C2720' }, // text and dark buttons
  line: { DEFAULT: '#DDD8D0', strong: '#B9B2A7' }, // hairlines and control borders
  gilt: { DEFAULT: '#A2845A', soft: '#D9C7A7' }, // champagne accent, deepened for legibility
  noir: { DEFAULT: '#0F0E0C', on: '#F3EEE6' }, // dark editorial tiles and text on them
  metal: {
    yellow: { light: '#F6E3A6', mid: '#D8B25A', deep: '#B88E35' },
    white: { light: '#FAFAF8', mid: '#D7D6D2', deep: '#AFAEAA' },
    rose: { light: '#F7D4C2', mid: '#DCA28A', deep: '#BF7E66' },
    black: { light: '#6B6763', mid: '#2C2A27', deep: '#121110' },
  },
};

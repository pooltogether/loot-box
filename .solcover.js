module.exports = {
  mocha: { reporter: 'mocha-junit-reporter' },
  skipFiles: [
    "external",
    "test",
    "ERC721.sol"
  ]
};

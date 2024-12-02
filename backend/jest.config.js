module.exports = {
  testMatch: ['**/?(*.)+(spec|test).[t]s?(x)'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  modulePathIgnorePatterns: ["group21-phase1-handoff"],
};
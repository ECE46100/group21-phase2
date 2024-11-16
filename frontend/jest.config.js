module.exports = {
    preset: 'ts-jest', // Use ts-jest preset for TypeScript support
    testEnvironment: 'jsdom', // Set environment for DOM testing
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'], // Match test files
    transform: {
      '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
    },
    moduleNameMapper: {
      '^.+\\.(css|less)$': '<rootDir>/config/CSSStub.js'
    },
  };
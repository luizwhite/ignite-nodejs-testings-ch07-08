import fs from 'fs';
import stripJsonComments from 'strip-json-comments';
import type { InitialOptionsTsJest } from 'ts-jest/dist/types';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const tsConfigString = fs.readFileSync('./tsconfig.json', 'utf8');
const tsConfigParsed = JSON.parse(stripJsonComments(tsConfigString));
const { compilerOptions } = tsConfigParsed;

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  bail: true,
  clearMocks: true,
  coverageProvider: 'v8',
  rootDir: '.',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src',
  }),
};

export default config;

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/domain/**/*.{ts,tsx}', // Incluir pruebas de domain
    'src/infrastructure/**/*.{ts,tsx}', // Incluir pruebas de infrastructure
    '!src/**/*.d.ts', // Excluir archivos de declaración
    '!src/presentation/**', // Excluir todo lo que está en presentation
    '!src/domain/exceptions/**', // Excluir exceptions
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit-report.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' > ',
      suiteNameTemplate: '{filename}',
      usePathForSuiteName: true
    }]
  ],
  coverageReporters: ['lcov', 'text-summary'],
  testResultsProcessor: "jest-sonar-reporter"
}
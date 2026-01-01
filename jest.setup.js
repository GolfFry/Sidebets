import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  app: {},
  auth: {},
  db: {},
}))

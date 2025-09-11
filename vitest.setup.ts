// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// React 19 testing compat: ensure globalThis.process.env.NODE_ENV is 'development'
if (!globalThis.process) {
  // @ts-ignore
  globalThis.process = { env: {} }
}
globalThis.process.env = {
  ...(globalThis.process.env || {}),
  NODE_ENV: 'development',
}

// Optional: enable act environment flag for React Testing Library
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

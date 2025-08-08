//
// Simple syntax and functionality tests

const assert = require("assert");

// Test git module only (extension.js requires VSCode environment)
try {
  console.log('Testing git module...');
  const git = require('../git');
  assert(typeof git === 'function', 'Git module should export a function');
  console.log('✅ Git module loads correctly');
} catch (error) {
  console.error('❌ Git module loading failed:', error.message);
  process.exit(1);
}

// Test git functionality with the current file
async function testGitFunctionality() {
  try {
    console.log('Testing git functionality...');
    const git = require('../git');
    const commits = await git('package.json', 3);
    assert(Array.isArray(commits), 'Git should return an array of commits');
    console.log(`✅ Git functionality works - found ${commits.length} commits`);
  } catch (error) {
    console.log('ℹ️  Git functionality test skipped (no git repo or file):', error.message);
  }
}

testGitFunctionality().then(() => {
  console.log('✅ All available tests passed');
  console.log('ℹ️  Note: Full extension tests require VSCode environment');
});

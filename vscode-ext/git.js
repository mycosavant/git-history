const { execa } = require("execa");
const pather = require("path");

async function getCommits(path, last, before) {
  // Validate inputs
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid file path');
  }
  
  const maxCount = Math.min(Math.max(1, parseInt(last) || 15), 100);
  const sanitizedBefore = before && typeof before === 'string' ? before.replace(/[^a-zA-Z0-9_-]/g, '') : null;
  
  const format = `{"hash":"%h","author":{"login":"%aN"},"date":"%ad"},`;
  
  try {
    const { stdout } = await execa(
      "git",
      [
        "log",
        `--max-count=${sanitizedBefore ? maxCount + 1 : maxCount}`,
        `--pretty=format:${format}`,
        "--date=iso",
        `${sanitizedBefore || "HEAD"}`,
        "--",
        pather.basename(path)
      ],
      { 
        cwd: pather.dirname(path),
        timeout: 30000 // 30 second timeout
      }
    );
    
    if (!stdout.trim()) {
      return [];
    }
    
    const json = `[${stdout.slice(0, -1)}]`;

    const messagesOutput = await execa(
      "git",
      [
        "log",
        `--max-count=${maxCount}`,
        `--pretty=format:%s`,
        `${sanitizedBefore || "HEAD"}`,
        "--",
        pather.basename(path)
      ],
      { 
        cwd: pather.dirname(path),
        timeout: 30000 // 30 second timeout
      }
    );

    const messages = messagesOutput.stdout.replace(/"/g, '\\"').split(/\r?\n/);

    const result = JSON.parse(json).map((commit, i) => ({
      ...commit,
      date: new Date(commit.date),
      message: messages[i] || ''
    }));

    return sanitizedBefore ? result.slice(1) : result;
  } catch (error) {
    console.error('Git command error:', error);
    throw new Error(`Failed to get git commits: ${error.message}`);
  }
}

async function getContent(commit, path) {
  // Validate inputs
  if (!commit || !commit.hash || !path) {
    throw new Error('Invalid commit or path');
  }
  
  // Sanitize commit hash - only allow alphanumeric characters and hyphens
  const sanitizedHash = commit.hash.replace(/[^a-fA-F0-9]/g, '');
  if (!sanitizedHash) {
    throw new Error('Invalid commit hash');
  }
  
  try {
    const { stdout } = await execa(
      "git",
      ["show", `${sanitizedHash}:./${pather.basename(path)}`],
      { 
        cwd: pather.dirname(path),
        timeout: 30000 // 30 second timeout
      }
    );
    return stdout;
  } catch (error) {
    console.error('Git show error:', error);
    // Return empty string instead of throwing to allow partial results
    return '';
  }
}

module.exports = async function(path, last, before) {
  try {
    const commits = await getCommits(path, last, before);
    await Promise.all(
      commits.map(async commit => {
        try {
          commit.content = await getContent(commit, path);
        } catch (error) {
          console.warn(`Failed to get content for commit ${commit.hash}:`, error.message);
          commit.content = '';
        }
      })
    );
    return commits;
  } catch (error) {
    console.error('Error in git module:', error);
    throw error;
  }
};

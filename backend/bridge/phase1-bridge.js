async function getRating(packageUrl) {
  const { analyze } = await import('../group21-phase1-handoff/dist/commands/analyze.js');
  return await analyze(packageUrl);
}

module.exports = {
  getRating
};
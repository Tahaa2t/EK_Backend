
function extractNames(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { first_name: '', last_name: '' };
  }

  const parts = fullName.trim().split(/\s+/);

  const first_name = parts[0] || '';
  const last_name = parts.length > 1 ? parts.slice(1).join(' ') : '';

  return { first_name, last_name };
}

module.exports = {
  extractNames
};

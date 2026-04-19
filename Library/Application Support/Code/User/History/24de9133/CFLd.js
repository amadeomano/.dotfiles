// @ts-check

/**
 * @param {string} path
 * @param {string} [prefix]
 * @param {string} [papiPath]
 * @returns {string}
 */
const formatPath = (path, prefix, papiPath) => {
  console.log(path, prefix, papiPath);
  const formattedPrefix = prefix ? `/${prefix}` : '';
  const targetPath = papiPath ? papiPath : path;
  return (
    formattedPrefix +
    targetPath.replace(/\{(.*?)\}/gs, (_, param) => `:${param}`)
  );
};

module.exports = {
  formatPath,
};

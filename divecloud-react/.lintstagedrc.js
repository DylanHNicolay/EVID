module.exports = {
  'src/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --max-warnings=0 --fix',
  ],
  'src/**/*.{json,css,md}': [
    'prettier --write',
  ],
};

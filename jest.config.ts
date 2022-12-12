module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  testPathIgnorePatterns: ["./__tests__/data.ts"],
};

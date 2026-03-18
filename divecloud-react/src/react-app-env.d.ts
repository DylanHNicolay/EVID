/// <reference types="react-scripts" />

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

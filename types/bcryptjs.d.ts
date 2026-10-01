declare module 'bcryptjs' {
  export function compareSync(value: string, encrypted: string): boolean;
}

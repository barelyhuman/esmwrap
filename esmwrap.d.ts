declare type PathGlob = string;
declare function esmwrap(source: PathGlob, destinationDirectory: PathGlob): Promise<void>;
export { esmwrap };
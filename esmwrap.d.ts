declare type PathGlob = string;
declare type ESMWRAPOptions = {
  extenstion: string;
};
declare function esmwrap(source: PathGlob, destinationDirectory: PathGlob, options: ESMWRAPOptions): Promise<void>;
export { esmwrap };

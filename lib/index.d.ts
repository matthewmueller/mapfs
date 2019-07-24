export = mapfs;
declare function mapfs(root: string, map: {
    [path: string]: string | Buffer;
}): Promise<() => Promise<void>>;

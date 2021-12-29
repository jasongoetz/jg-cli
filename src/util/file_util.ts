import fs from "fs";
import {parse} from "csv";
import getStream from "get-stream";

export const ensureFileExists = (path: string, create?: boolean) => {
    if (!fs.existsSync(path)) {
        if (!create) {
            throw new Error(`Missing required file ${path}`);
        } else {
            fs.writeFileSync(path, '');
        }
    }
};

export const readCSVFile = async (filePath: string): Promise<any> => {
    const parseStream = parse({delimiter: ',', columns: true});
    return await getStream.array(fs.createReadStream(filePath).pipe(parseStream))
}

export const writeFile = (path: string, contents: string) => new Promise<void>((resolve, reject) => {
    try {
        fs.writeFile(path, contents, err => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    } catch (e) {
        reject(e);
    }
});

export const writeDir = (dir: string): void => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

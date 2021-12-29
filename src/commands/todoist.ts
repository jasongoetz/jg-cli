import type {Arguments, CommandBuilder} from 'yargs';
import fs from "fs";
import {ensureFileExists, readCSVFile, writeDir, writeFile} from "../util/file_util";

type Options = {
    file: string;
    labels: string[];
};

const TYPE_KEY = '\uFEFFTYPE'; //For some reason, the CVS exported from Todoist has this zero-width no-break space in it

type TodoistTask = {
    title: string;
    description: string;
    notes: TodoistComment[];
}

type TodoistComment = {
    content: string;
    date: Date;
}

export const command: string = 'todoist <file>';
export const desc: string = 'Extract Todoist CSV to individual formatted files';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .option('labels', {
            type: 'string',
            array: true,
            alias: 'l',
            describe: 'Labels to apply to everything exported',
        })
        .positional('file', { type: 'string', demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
    const { file, labels } = argv;

    ensureFileExists(file);
    const todoistEntries = await getTodoistEntriesFromCSV(file);

    const outputDir = file.replace(/.*\/(.*?)\.csv/, "$1");
    writeDir('./output');
    writeDir(`./output/${outputDir}`);
    for (const entry of todoistEntries) {

        //I commonly put URLs into the title of todoist tasks
        const url = getURLFromString(entry.title);
        let title = removeURLs(entry.title);

        //Ingredient List (I regularly list key ingredients for a recipe in the title separated by commas, inside of parentheses
        const ingredientList = getIngredientListFromString(title);
        title = removeIngredientList(title);

        //Text labels are in the title of Todoist tasks and start with @-symbol.
        let tags = getLabelsFromString(title);
        title = removeLabels(title);

        title = title.replace(/[\[(](.*?)[\])]/, "$1").trim();
        title = title.replace("/", "").trim();
        title = title.length === 0 ? 'FIX_ME' : title; //I sometimes would not have a title at all

        console.log(`Generating "${title}"...`);
        if (tags.length > 0) {
            console.log("\tLABELS: " + JSON.stringify(tags));
        }

        let content = `\n${(labels || []).concat(tags).map(tag => `#${tag}`).join(' ')}\n\n`
            + (url ? `<a href="${url}">${url}</a>\n\n` : '');
        content = entry.notes
            .reduce((content, note) => `${content}\n</b>${note.date}</b>:\n\n${note.content}\n`, content);

        content = `<html lang="en"><head><title>${title}</title></head><body><h2>${ingredientList}</h2>${content}</body>`;
        content = content.replace(/\n/g, '<br/>');

        while (fs.existsSync(`./output/${outputDir}/${title}.html`)) {
            title += 'E';
        }

        await writeFile(`./output/${outputDir}/${title}.html`, content);
    }

};

async function getTodoistEntriesFromCSV(file: string) {
    let todoistEntries: TodoistTask[] = [];

    const csvData = await readCSVFile(file);
    for (const row of csvData) {
        if (row[TYPE_KEY] === 'task') {
            todoistEntries.push({
                title: row['CONTENT'],
                description: row['DESCRIPTION'],
                notes: []
            })
        } else if (row[TYPE_KEY] === 'note') {
            todoistEntries[todoistEntries.length - 1].notes.push({
                content: row['CONTENT'],
                date: row['DATE'],
            })
        }
    }
    return todoistEntries;
}

function getURLFromString(content: string) {
    const urlRegExp = new RegExp(
        /https?:\/\/[^\s)]+/,
        "g"
    );

    let urls = content.match(urlRegExp);
    return urls ? urls[0] : undefined;
}

function removeURLs(content: string) {
    return content.replace(/\(?https?:\/\/[^\s)]+\)?/g, '');
}

function getLabelsFromString(content: string) {
    const labelsRegExp = new RegExp(
        /\B(@[a-zA-Z-_]+\b)(?!;)/,
        "g"
    );

    let labels = content.match(labelsRegExp);
    return labels ? labels.map(label => label.replace('@', '')) : [];
}

function removeLabels(content: string) {
    return content.replace(/\B(@[a-zA-Z-_]+\b)(?!;)/g, '');
}

function getIngredientListFromString(content: string) {
    const listRegExp = new RegExp(
        /\((([\w\s’\/]+,\s+)+[\w\s’\/]+)\)/
    )

    let ingredientList = content.match(listRegExp);
    return ingredientList ? ingredientList[1] : undefined;
}

function removeIngredientList(content: string) {
    return content.replace(/\(([\w\s’'\/]+,\s+)+[\w\s’'\/]+\)/g, '');
}





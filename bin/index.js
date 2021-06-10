#!/usr/bin/env node

const fs = require('fs');
const { Table } = require('console-table-printer');
const yargs = require('yargs');

const usage = "\nUsage: sarif-analyzer --file filepath";
yargs
    .usage(usage)
    .option('f', {
        alias: "file",
        describe: 'file path to be displayed',
        type: 'string',
        demandOption: true
    })
    .option("p", {
        alias: "pretty",
        describe: "Display the results in vertical format",
        type: "boolean",
        demandOption: false
    })
    .help(true)
    .argv;

const isDisplayVertically = yargs.argv.pretty;

if (!yargs.argv.file) {
    console.error('file path provided has error');
    return;
}

function color(level) {
    switch (level) {
        case 'error':
            {
                return 'red'
            }
        case 'warning':
            {
                return 'yellow'
            }
        case 'note':
            {
                return 'cyan'
            }
    }
}

fs.readFile(yargs.argv.file, 'utf8', function(err, data) {
    if (err) throw err;
    const sarifData = JSON.parse(data);
    let results = [];
    sarifData.runs.map(run => {
        run.results.map(result => {
            const tableRecord = {
                level: result.level || null,
                message: result.message.text || null,
                location: null,
                ruleId: result.ruleId,
            }
            if (Object.keys(result).includes('locations')) {
                result.locations.map(location => {
                    tableRecord.location = location.physicalLocation.artifactLocation.uri;
                    results.push(tableRecord);
                });
            } else {
                results.push(tableRecord);
            }
        });
    });

    console.log('Total issues found :: ', results.length);
    if (results.length === 0) {
        return;
    }
    if (!isDisplayVertically) {
        const table = new Table();

        results.map(result => {
            result.level ? table.addRow(result, { color: color(result.level) }) : table.addRow(result);
        });
        table.printTable();
        return;
    }


    results.map((result, idx) => {
        const padNumber = Math.max(...Object.keys(result).map(key => key.length));
        console.log(`***********************[ ${idx}. row ]***********************`)
        Object.keys(result).map(key => {
            console.log(`${key.padEnd(padNumber)} : ${result[key]}`)
        });
        return;
    })
});
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import { execSync } from 'child_process';
const { exec, spawn } = require('child_process');

async function run() {
    try {
        console.log('Starting Code Coverage...');
        
        // 1. Execute VSTest.exe to generate the blabla.coverage file
        executeVsTestCodeCoverage();

        // 2. Execute Code Coverage Analyze
        executeCodeCoverageAnalyze();

        console.log('Ended Code Coverage.');
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
        console.error('[run] Error unexpected! Error[' + err.message + ']', err);
    }
}

function executeVsTestCodeCoverage(){
    console.log('Starting executeVsTestCodeCoverage...');

    const vsTestExeFileLocation: string = tl.getInput('vsTestExeFileLocation', true);
    var vsTestExeFileList : string[] = ['**\\vstest.console.exe'];
    const vsTestExeFiles : string[] = findFiles(vsTestExeFileLocation, vsTestExeFileList);
    vsTestExeFiles.forEach(exe => {
        console.log('Found vsTestExeFile [' + exe + ']');
    });
    var vsTestExeFile = vsTestExeFiles[0];
    
    const coverageCommand: string = tl.getInput('vsTestArgs', true);
    
    const listFiles : string[] = findTestFiles();

    let projectPaths = '';

    listFiles.forEach(pPathFile => {
        console.log('Generating coverage for file [' + pPathFile + ']');
        projectPaths += '"' + pPathFile + '" ';
    });

    console.log('Generating coverage for all files in one shot. [' + projectPaths + ']');
    
    console.log('"' + vsTestExeFile + '" ' + projectPaths + ' ' + coverageCommand + '');
    
    execSync('"' + vsTestExeFile + '" ' + projectPaths + ' ' + coverageCommand + '');

    console.log('Ended executeVsTestCodeCoverage...');
}

function getTemporaryDirectory(){
    var inputTest = tl.getInput('temporaryFolderForCodeCoverage', true);
    var tempDirectory: string = '';

    tempDirectory = tl.getVariable(inputTest);

    // If we don't find a variable, we will consider that as a Path
    if(tempDirectory == undefined){
        tempDirectory = inputTest;
    }
    return tempDirectory;
}

function executeCodeCoverageAnalyze(){
    console.log('Starting executeCodeCoverageAnalyze...');
    const listFiles : string[] = findCoverageFiles();
    const temporaryDirectoryPath : string = getTemporaryDirectory();
    
    const codeCoverageExeFileLocation: string = tl.getInput('codeCoverageExeFileLocation', true);
    var vsCodeCoverageExeFileList : string[] = ['**\\CodeCoverage.exe'];
    const vsCodeCoverageExeFiles : string[] = findFiles(codeCoverageExeFileLocation, vsCodeCoverageExeFileList);
    vsCodeCoverageExeFiles.forEach(exe => {
        console.log('Found vsCodeCoverageExeFile [' + exe + ']');
    });

    var vsCodeCoverageExeFile = vsCodeCoverageExeFiles[0];    
    
    const codeCoverageArg: string = tl.getInput('codeCoverageArgs', true);
    var fileCoverageXml = tl.getInput('temporaryFileCoveragexml', true);
    const command : string =  codeCoverageArg + temporaryDirectoryPath + fileCoverageXml;

    var allPathFiles : string = '';
    listFiles.forEach(fiPathFile => {
        console.log('Converting this file[' + fiPathFile + '] to [' + fileCoverageXml + ']');
        allPathFiles += allPathFiles == '' ? '' : ' ';
        allPathFiles += '"' + fiPathFile + '"';
    });

    console.log('Converting All these files[' + allPathFiles + '] to [' + fileCoverageXml + ']');
    exec('"' + vsCodeCoverageExeFile + '" ' + command + ' ' + allPathFiles, (error, stdout, stderr) => {
        if (error) {
            console.error(`[executeCodeCoverageAnalyze] Error unexpected! Error[${error}] `);
            return;
        } else {
            console.log('All the files were converted to one Coveragexml sucessfully.');
        }
    });

    console.log('Ended executeCodeCoverageAnalyze...');
}

function findTestFiles(){
    var searchFolder: string = tl.getInput('searchFolderForTestFiles');
    var listTestFiles : string[] = tl.getDelimitedInput('listTestFiles', '\n', true);
    return findFiles(searchFolder, listTestFiles);
}

function findCoverageFiles(){
    var searchFolder: string = tl.getInput('searchFolderForCodeCoverageFile');
    var listTestFiles : string[] = ['**\\TestResults\\**\\*.coverage'];
    return findFiles(searchFolder, listTestFiles);
}

function findFiles(searchFolder, listTestFiles){
    // Sending allowBrokenSymbolicLinks as true, so we don't want to throw error when symlinks are broken.
    // And can continue with other files if there are any.
    const findOptions = <tl.FindOptions>{
        allowBrokenSymbolicLinks: true,
        followSpecifiedSymbolicLink: true,
        followSymbolicLinks: true
    };

    const matchingTestResultsFiles = tl.findMatch(searchFolder, listTestFiles, findOptions);
    return matchingTestResultsFiles;
}

run();

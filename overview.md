# Coverage Converter

Example .YML/YAML Usage Pattern

```
- task: VisualStudioTestPlatformInstaller@1
  inputs:
   packageFeedSelector: nugetOrg
   versionSelector: latestStable

- task: VSTest@2
  inputs:
    testSelector: testAssemblies
    testAssemblyVer2: |
      **\bin\**\*.Tests*.dll
      !**\obj\** 
      !**\bin\**\ref\**
      !**\bin\**\*Integration*.dll
    platform: '$(buildPlatform)'
    configuration: '$(buildConfiguration)'
    codeCoverageEnabled: true
    vsTestVersion: toolsInstaller
    testFiltercriteria: 'TestCategory!=Integration&TestCategory!=UI&TestCategory!=Chrome'

- task: CoverageConverterMod@0
  inputs:
    searchFolderForTestFiles: '$(System.DefaultWorkingDirectory)'
    #vsTestExeFileLocation: '$(Agent.HomeDirectory)\_work\_tool\VsTest\16.9.4\x64\tools\net451\Common7\IDE\Extensions\TestPlatform\vstest.console.exe'
    vsTestExeFileLocation: '$(Agent.HomeDirectory)\_work\_tool\VsTest\'
    vsTestArgs: '/EnableCodeCoverage'
    listTestFiles: |
      **\bin\**\*.Tests*.dll
      !**\obj\** 
      !**\bin\**\ref\**
      !**\bin\**\*Integration*.dll
    searchFolderForCodeCoverageFile: '$(System.DefaultWorkingDirectory)'
    temporaryFolderForCodeCoverage: 'Agent.TempDirectory'
    temporaryFileCoveragexml: '\TestResults\DynamicCodeCoverage.coveragexml'
    codeCoverageArgs: 'analyze /output:Coverage.xml'
    #codeCoverageExeFileLocation: '$(Agent.HomeDirectory)\_work\_tool\VsTest\16.9.4\x64\tools\net451\Team Tools\Dynamic Code Coverage Tools\CodeCoverage.exe'
    codeCoverageExeFileLocation: '$(Agent.HomeDirectory)\_work\_tool\VsTest\'
```

From original https://github.com/Rogeriohsjr/CoverageConverter

This Task converts .coverage file into .coveragexml to be used with other Tasks to generate a Code Coverage Report in Azure Pipeline(Azure DevOps).

### Steps:
- Execute VSTest@2 to upload Tests to Azure DevOps
- Execute CoverageConverter@0 to generate the DynamicCodeCoverage.coveragexml
- Execute reportgenerator@4 to generate the Reports from DynamicCodeCoverage.coveragexml generated above
- Execute PublishCodeCoverageResults@1 to post the Result from reportgenerator@4

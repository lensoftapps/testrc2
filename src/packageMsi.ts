import { MSICreator } from 'electron-wix-msi';
import * as path from "path";
import { getAppName, getAppVersion, getAppIconPath, getAppUpgradeCode } from './controller/util';

const appName = getAppName();
const appVersion = getAppVersion();

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
  //appDirectory: path.resolve('out/' + appName + '-win32-ia32'), // '/path/to/built/app',
  appDirectory: 'G:/wcs/electron/js/3_electron-auto-update-example-master/dist/win-unpacked',
  description: 'School eBook Reader',
  appIconPath: path.resolve(getAppIconPath('')),
  exe: appName,
  name: appName,
  shortName: appName.replace(' ', ''),
  manufacturer: 'ReadCloud',
  version: appVersion,
  upgradeCode: getAppUpgradeCode(),
  outputDirectory: path.resolve('out/wix-msi-' + appName),
  ui: {
    chooseDirectory: true,
    images: {
      background: path.resolve(getAppIconPath('bg')),
      banner: path.resolve(getAppIconPath('banner'))
    }
  },
  features: { autoUpdate: true, autoLaunch: false },
  installLevel: 3 // make the autoUpdate checked by default
});

async function createMsi() {
  // Step 2: Create a .wxs template file
  const supportBinaries = await msiCreator.create();

  // 🆕 Step 2a: optionally sign support binaries if you
  // sign you binaries as part of of your packaging script
  /*supportBinaries.forEach(async (binary:any) => {
    // Binaries are the new stub executable and optionally
    // the Squirrel auto updater.
    await signFile(binary);
  });*/

  // Step 3: Compile the template to a .msi file
  await msiCreator.compile();
}

createMsi();
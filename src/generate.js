import fs from "fs";
import path from "path";
import { generateFromYarnLock } from "./generateFromYarnLock";

export async function generate(targetPath = process.cwd()) {
  const yarnLockString = fs.readFileSync(
    path.resolve(targetPath, "yarn.lock"),
    "utf-8"
  );
  const packageJsonString = fs.readFileSync(
    path.resolve(targetPath, "package.json"),
    "utf-8"
  );
  const packageJson = JSON.parse(packageJsonString);

  const result = await generateFromYarnLock(yarnLockString, packageJson);

  fs.writeFileSync("./import-map.json", JSON.stringify(result, null, 2));
}

generate();

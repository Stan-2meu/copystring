#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const findup = require("findup-sync");

///////////////////////////////////////////////////////////
// options

const readJSON = (path) =>
  path ? JSON.parse(fs.readFileSync(path, "utf-8")) : null;
const optionFile = readJSON(findup("2dub.config.json"))?.copystring;
const defaultOptions = readJSON(
  path.join(__dirname, "defaultOptions.json")
)?.copystring;
const optionKeys = Object.keys(defaultOptions);
if (optionFile) {
  Object.keys(optionFile).forEach((key) => {
    if (!optionKeys.includes(key)) {
      const errorMsg =
        "지원하지 않는 옵션 : " +
        key +
        "\n가능한 옵션 : " +
        optionKeys.join(", ");
      console.error(errorMsg);
      //   throw new Error("지원하지 않는 옵션");
      process.exit(1);
    }
  });
} else {
  console.warn(" * 2dub.config.json 없음. 기본값으로 진행");
}
const options = optionKeys.reduce((acc, key) => {
  if (optionFile?.[key] !== undefined) {
    acc[key] = optionFile[key];
  }
  return acc;
}, defaultOptions);

const { searchThrough, searchFor } = options;

///////////////////////////////////////////////////////////
// code

function get_PATH_TO_STRING() {
  const filePath = searchThrough.reduce((prev, cur) => {
    return prev ?? findup(cur);
  }, null);
  if (!filePath) {
    console.error(
      "다음 파일 중 하나는 있어야 합니다 : ",
      searchThrough.join(", ")
    );
    process.exit(1);
  }
  const targetLine = `${searchFor}=`;

  const data = fs.readFileSync(filePath, "utf8");
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));

  const found = lines.find((line) => line.startsWith(targetLine));

  if (found) {
    // Extract the path from the line
    const PATH_TO_STRING = found.split("=")[1].trim();
    return PATH_TO_STRING;
  }
  throw new Error(
    `다음 파일[${searchThrough.join(", ")}] 중 하나에 ${searchFor}를 정의하세요.
    예시) (따옴표없음)\n  솔루션 ${searchFor}=/Users/2meu36/work/localize2dub/interviewSolution\n  클래스 ${searchFor}=/Users/2meu36/work/localize2dub/ClassWeb`
  );
}

const PATH_TO_STRING = get_PATH_TO_STRING();
const PATH_TO_WORKING_DIR = ".";

if (!fs.existsSync(PATH_TO_STRING)) {
  throw new Error(`스트링 폴더 찾을 수 없음 : ${PATH_TO_STRING}`);
}

function removeTrailingSlash(dirPath) {
  return dirPath.replace(/\/+$/, "");
}

// Remove trailing slashes from PATH_TO_STRING and PATH_TO_WORKING_DIR
const cleanPathToWorkingDir = removeTrailingSlash(PATH_TO_WORKING_DIR);
const localizeDirPath = removeTrailingSlash(PATH_TO_STRING);

console.log(
  "================================[ COPY STRING START ]================================"
);
console.log(`>> PATH_TO_STRING: ${localizeDirPath}`);

async function theFunction() {
  // [1] git pull $LOCALIZE_DIR in $PATH_TO_STRING/$LOCALIZE_DIR
  console.log(`>> [1] 스트링 git pull > ${localizeDirPath}`);
  execSync(`cd ${localizeDirPath} && git pull`);
  process.chdir(cleanPathToWorkingDir); // Return to the original working directory

  // [2] copy [$PATH_TO_STRING/$LOCALIZE_DIR/$APP_NAME/en.json] to  [$PATH_TO_WORKING_DIR/public/locales/en/common.json]
  const sourceEnJson = path.join(localizeDirPath, "en.json");
  const destEnJson = path.join(
    cleanPathToWorkingDir,
    "public/locales/en/common.json"
  );
  const copyEn = fs.existsSync(sourceEnJson);
  if (copyEn) {
    if (!fs.existsSync(path.join(cleanPathToWorkingDir, "public/locales/en"))) {
      fs.mkdirSync(path.join(cleanPathToWorkingDir, "public/locales/en"), {
        recursive: true,
      });
    }
    console.log(
      `>> [2] 영어 업데이트 완료  [${sourceEnJson}] -> [${destEnJson}]`
    );
    fs.copyFileSync(sourceEnJson, destEnJson);
  } else {
    console.log(`>> [2] 영어 스킵. 파일 없음 : [${sourceEnJson}]`);
  }

  // [3] copy [$PATH_TO_STRING/$LOCALIZE_DIR/$APP_NAME/ko.json] to  [$PATH_TO_WORKING_DIR/public/locales/ko/common.json]
  const sourceKoJson = path.join(localizeDirPath, "ko.json");
  const destKoJson = path.join(
    cleanPathToWorkingDir,
    "public/locales/ko/common.json"
  );
  const copyKo = fs.existsSync(sourceKoJson);
  if (copyKo) {
    if (!fs.existsSync(path.join(cleanPathToWorkingDir, "public/locales/ko"))) {
      fs.mkdirSync(path.join(cleanPathToWorkingDir, "public/locales/ko"), {
        recursive: true,
      });
    }
    console.log(
      `>> [3] 한글 업데이트 완료  [${sourceKoJson}] -> [${destKoJson}]`
    );
    fs.copyFileSync(sourceKoJson, destKoJson);
  } else {
    console.log(`>> [3] 한글 스킵. 파일 없음 : [${sourceKoJson}]`);
  }

  // [4] copy [$PATH_TO_STRING/$LOCALIZE_DIR/$APP_NAME/ja.json] to  [$PATH_TO_WORKING_DIR/public/locales/ja/common.json]
  const sourceJaJson = path.join(localizeDirPath, "ja.json");
  const destJaJson = path.join(
    cleanPathToWorkingDir,
    "public/locales/ja/common.json"
  );
  const copyJa = fs.existsSync(sourceJaJson);
  if (copyJa) {
    if (!fs.existsSync(path.join(cleanPathToWorkingDir, "public/locales/ja"))) {
      fs.mkdirSync(path.join(cleanPathToWorkingDir, "public/locales/ja"), {
        recursive: true,
      });
    }
    console.log(
      `>> [4] 일본어 업데이트 완료  [${sourceJaJson}] -> [${destJaJson}]`
    );
    fs.copyFileSync(sourceJaJson, destJaJson);
  } else {
    console.log(`>> [4] 일본어 스킵. 파일 없음 : [${sourceJaJson}]`);
  }

  console.log(
    "===============================[ COPY STRING FINISHED ]=============================="
  );
}

theFunction();

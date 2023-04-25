const vrcScreenshotsUtil = {
  fileNameToPath: (fileName, dataDir) => {
    const metaData = vrcScreenshotsUtil.parseVrchatScreenshotName(fileName);
    const filePath = `${dataDir}/assets/${metaData.year}/${
      metaData.month
    }/${fileName.replace(".png", "")}/original.png`;
    return filePath;
  },
  parseVrchatScreenshotName: (fileName) => {
    const fileNameSplit = fileName.replaceAll("NYE23-", "NYE23_").split("_");
    const metaData = fileNameSplit[1].includes("x")
      ? {
          month: fileNameSplit[2]?.split("-")[1],
          day: fileNameSplit[2]?.split("-")[2],
          year: fileNameSplit[2]?.split("-")[0],
          width: fileNameSplit[1]?.split("x")[0],
          height: fileNameSplit[1]?.split("x")[1]
        }
      : {
          month: fileNameSplit[1]?.split("-")[1],
          day: fileNameSplit[1]?.split("-")[2],
          year: fileNameSplit[1]?.split("-")[0],
          width: parseInt(fileNameSplit[3]?.split("x")[0], 10),
          height: parseInt(fileNameSplit[3]?.split("x")[1], 10)
        };
    return metaData;
  }
};

export const { parseVrchatScreenshotName, fileNameToPath } = vrcScreenshotsUtil;
export default vrcScreenshotsUtil;

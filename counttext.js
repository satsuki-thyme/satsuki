function counttext(targetDir, eachOpusPrefix, indexFile, indvIndexFile, mainHeading, excludeHeading) {
  /* 
  # ex.
  - targetDir = `scribe/novel`
  - indexFile = `index.json`
  - indvIndexFile = `README.md`
  - mainHeading = `本文`
  - excludeHeading = `(?:説明|動作|使い方|CDN)`
  */
  return fetch(`${targetDir}/${indexFile}`)
  .then(async indexSrc => {
    if (indexSrc.ok) {
      let index = await indexSrc.json()
      let allLen = await Promise.all(
        index
        .map(async eachOpus => {
          return new Promise(resolve => {
            resolve(
              fetch(`${targetDir}/${eachOpusPrefix}${eachOpus.dn}/${indvIndexFile}`)
              .then(async tocSrc => {
                if (tocSrc.ok) {
                  let toc = (await tocSrc.text())
                  let countTotalNum = async list => {
                    let devLen = (
                      await Promise.all(
                        list
                        .map(eachLine => {
                          if (eachLine === ``) {
                            return false
                          }
                          let indvLen = fetch(`${targetDir}/${eachOpusPrefix}${eachOpus.dn}/${eachLine}`)
                          .then(async mainSrc => {
                            if (mainSrc.ok) {
                              let len = (await mainSrc.text())
                              .replace(/(^|[\r\n])(#+ .*|[ \t]*([\-+*]|\d+\.) .*)/g, ``)
                              .replace(/[ \t　\r\n]|^\\/g, ``)
                              .replace(/[|｜](.+?)《.+?》/g, `$1`)
                              .replace(/(p{scx=Han}+)《.+?》/g, `$1`)
                              .replace(/(p{scx=Han}+)\((p{scx=Hira}|p{scx=Kana})+?\)/g, `$1`)
                              .replace(/(p{scx=Han}+)（(p{scx=Hira}|p{scx=Kana})+?）/g, `$1`)
                              .replace(/[|｜]([《\(（])(.+?)([》\)）])/g, `$1$2$3`)
                              .replace(/#(.+?)__.+?__#/g, `$1`)
                              .length
                              return len
                            }
                          })
                          return indvLen
                        })
                      )
                    )
                    .reduce((a, c) => Number(a) + Number(c), [0])
                    return devLen
                  }
                  let reMainList = new RegExp(`(?<=^|\\r?\\n)(?<sharp>#+ )${mainHeading}\\r?\\n(?:(?:[ \\t]*[\\-+*]|\\d+\\.) .*\\r?\\n)+`)
                  let reNegaList = new RegExp(`(?<=^|\\r?\\n)(?<sharp>#+ )${excludeHeading}\\r?\\n(?:(?:[ \\t]*[\\-+*]|\\d+\\.) .*\\r?\\n)+`, `g`)
                  let reList = /(?:(?<=[ \t]*([\-+*]|\d+\.) ).*?(?=[ \t]*[:：]|$))+/g
                  let mainList = (
                    toc
                    .match(reMainList) || [``]
                  )[0]
                  .match(reList) || [``]
                  let othersListMid = toc
                  .replace(reMainList, ``)
                  if (excludeHeading !== `` && excludeHeading !== undefined) {
                    othersListMid = othersListMid
                    .replace(reNegaList, ``)
                  }
                  let othersList = othersListMid
                  .match(reList) || [``]
                  return await countTotalNum(mainList)
                  .then(async mainNum => {
                    let othersNum = await countTotalNum(othersList)
                    return [
                      mainNum,
                      othersNum
                    ]
                  })
                }
              })
            )
          })
        })
      )
      let w = {}
      w.all = allLen
      .reduce((a, c) => {
        a.main = a.main + c[0]
        a.others = a.others + c[1]
        return a
      }, {"main": 0, "others": 0})
      w.indv = index
      .reduce((a, c, i) => a.concat([[c.dn, c.active, allLen[i][0], allLen[i][1]]]), [])
      .filter(rly => rly[1])
      .reduce((a, c) => {
        a[c[0]] = {"main": c[2], "others": c[3]}
        return a
      }, {})
      return w
    }
  })
}

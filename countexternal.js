async function countexternal(beganYear, targetDir, targetFileNameArray) {
  let promiseArray = []
  for (let item of targetFileNameArray) {
    promiseArray.push(
      await Promise.all(
        Array(
          new Date(Date.now()).getFullYear() - beganYear + 1
        )
        .fill(0)
        .reduce(a => [a[0].concat([beganYear + a[1]]), (a[1] += 1, a[1])], [[], 0])
        .shift()
        .map(rly => {
          return fetch(`${targetDir}/${item}-${rly}.txt`)
          .then(async rly => {
            if (rly.ok) {
              return (await rly.text())
              .replace(/^#+ /gm, ``)
              .replace(/(?<!\\(\\\\)*)(?<=\[.*?\])\(.*?\)|(?<!\\(\\\\)*)!\[.*?\]\(.*?\)/g, ``)
              .length
            }
          })
        })
      )
      .then(rly => {
        return rly.reduce((a, b) => a + b, 0)
      })
    )
  }
  return Promise.all(promiseArray)
  .then(rly => rly.reduce((a, b) => a + b, 0))
}

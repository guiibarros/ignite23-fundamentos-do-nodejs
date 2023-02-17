import fs from 'node:fs'
import { parse } from 'csv-parse'
import readline from 'node:readline'

const csvUrl = new URL('./tasks.csv', import.meta.url)

// ==> Alternative without csv-parse library <==
// async function execute() {
//   const csvLines = readline.createInterface({
//     input: fs.createReadStream(csvUrl),
//   })

//   let index = 0

//   for await (const line of csvLines) {
//     if (index !== 0) {
//       const [title, description] = line.split(',')

//       console.log({
//         title,
//         description,
//       })
//     }

//     index++
//   }
// }

async function execute() {
  const csvStream = fs.createReadStream(csvUrl)

  const csvParse = parse({
    delimiter: ',',
    skip_empty_lines: true,
    from_line: 2,
  })

  const csvLines = csvStream.pipe(csvParse)

  process.stdout.write('Starting')

  // Alternative: csvParse.on('data', line => { ... })
  for await (const line of csvLines) {
    const [title, description] = line

    fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      }),
    })

    process.stdout.write('.')
  }

  process.stdout.write('done.\n')
}

execute()
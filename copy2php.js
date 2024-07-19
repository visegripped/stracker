import fs from 'fs'

// File destination.txt will be created or overwritten by default.
fs.copyFile('./dist/index.html', './doc_root/index.html', (err) => {
  if (err) throw err;
  console.log('index moved');
});

fs.cp('./dist/assets/', './doc_root/assets/', { recursive: true }, (err) => {
  if (err) {
    console.error(err);
  }
  console.log('assets moved');
});
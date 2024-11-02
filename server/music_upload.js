const fs = require('fs');
const path = require('path');
const { MongoClient, GridFSBucket } = require('mongodb');

async function uploadPDFs() {
  const uri = 'mongodb+srv://nikithav678:sYJ48Y2WGCtKbaV4@capstone1.gcjwe8n.mongodb.net/?retryWrites=true&w=majority&appName=Capstone1';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('capstone');
    const bucket = new GridFSBucket(db, { bucketName: 'pdfReports' });

    const pdfFiles = [
      { path: "C:/Users/DELL/Capstone/music_lib_reports/pop1.pdf", filename: 'pop1' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/pop2.pdf", filename: 'pop2' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/rock1.pdf", filename: 'rock1' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/rock2.pdf", filename: 'rock2' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/classical1.pdf", filename: 'classical1' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/classical2.pdf", filename: 'classical2' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/bolly1.pdf", filename: 'bolly1' },
      { path: "C:/Users/DELL/Capstone/music_lib_reports/bolly2.pdf", filename: 'bolly2' },
    ];

    for (const file of pdfFiles) {
      const fileStream = fs.createReadStream(path.resolve(file.path));
      const uploadStream = bucket.openUploadStream(file.filename);

      fileStream.pipe(uploadStream);

      // Listen for finish and error events on the upload stream
      uploadStream.on('finish', () => {
        console.log(`${file.filename} uploaded successfully`);
      });

      uploadStream.on('error', (err) => {
        console.error(`Error uploading ${file.filename}:`, err);
      });
    }

    // Wait for a bit to ensure all uploads complete before closing the connection
    setTimeout(async () => {
      console.log('All uploads initiated. Closing MongoDB connection.');
      await client.close();
    }, 5000);

  } catch (error) {
    console.error('Failed to upload PDFs', error);
  }
}

uploadPDFs().catch(console.error);

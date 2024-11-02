const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const { Readable } = require('stream');
const mongoose = require('mongoose');



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Serve the audio files from the base folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/audio-files', express.static('C:/Users/DELL/Capstone/datasets/mp3'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const uploadMemory = multer({ storage: multer.memoryStorage() });
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MongoDB URI is not set in the environment variables');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('capstone');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

const dbPromise = connectToDatabase();

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sign-up route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;
    
    // Check if email is already registered
    const existingUser = await db.collection('User_Credentials').findOne({ emailid: email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    
    const user = {
      emailid: email,
      password: hashedPassword
    };

    await db.collection('User_Credentials').insertOne(user);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

// Sign-in route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await dbPromise;
    const user = await db.collection('User_Credentials').findOne({ emailid: email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    res.json({ success: true, userId: user._id });
    res.json({ success: true, userId: user._id });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ success: false, message: 'Error signing in' });
  }
});

// Fetch user details route
app.get('/user-details', async (req, res) => {
  const { email } = req.query;

  try {
    const db = await dbPromise;
    const user = await db.collection('User_Credentials').findOne({ emailid: email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const plagiarismChecks = await db.collection('Plagiarism_Checks').find({ userId: user._id }).toArray();

    res.json({
      success: true,
      user: {
        email: user.emailid,
        // Add other user details here as needed
        plagiarismChecks: plagiarismChecks
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Error fetching user details' });
  }
});


async function saveReport(userId, reportData) {
  const db = await dbPromise;
  const bucket = new GridFSBucket(db, { bucketName: 'reports' });

  const reportStream = Readable.from(reportData);

  return new Promise((resolve, reject) => {
    reportStream.pipe(bucket.openUploadStream('report.pdf', {
      metadata: { userId: new mongoose.Types.ObjectId(userId) }
    }))
    .on('error', (error) => {
      console.error('Error uploading report:', error);
      reject(new Error('Error uploading report'));
    })
    .on('finish', (result) => {
      resolve(result);
    });
  });
}

async function savePairReport(userId, reportBuffer) {
  const db = await dbPromise;
  const bucket = new GridFSBucket(db, { bucketName: 'pair_reports' });

  // Ensure userId is a valid ObjectId
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(userId);  // Validate userId
  } catch (err) {
    throw new Error('Invalid userId: ' + userId);  // Error if invalid userId
  }

  const reportStream = Readable.from(reportBuffer);

  return new Promise((resolve, reject) => {
    // Start uploading the report stream to GridFS
    const uploadStream = bucket.openUploadStream('pair_compare_report.pdf', {
      metadata: { userId: objectId, type: 'pair-comparison' },  // Include custom metadata
    });

    uploadStream.on('error', (error) => {
      console.error('Error during GridFS upload:', error);  // Log error
      reject(new Error('Error uploading pair comparison report'));
    });

    uploadStream.on('finish', () => {
      console.log('Upload finished, retrieving file metadata...');

      // Fetch the metadata using the filename or ID after the upload finishes
      bucket.find({ filename: 'pair_compare_report.pdf' }).toArray((err, files) => {
        if (err || !files || files.length === 0) {
          console.error('Error fetching file metadata:', err || 'No files found');
          return reject(new Error('Error fetching file metadata after upload'));
        }

        console.log('File metadata:', files[0]);  // Log the metadata for debugging
        resolve(files[0]);  // Resolve with the full file metadata
      });
    });

    // Pipe the report stream to GridFS
    reportStream.pipe(uploadStream);
  });
}






// Endpoint for uploading reports
app.post('/upload-report', uploadMemory.single('report'), async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await saveReport(userId, req.file.buffer);
    console.log('Report uploaded successfully:', result._id); // Added logging
    res.json({ success: true, message: 'Report uploaded successfully!', reportId: result._id });
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({ success: false, message: 'Error uploading report' });
  }
});

app.post('/save-pair-report', uploadMemory.single('report'), async (req, res) => {
  console.log('Request body:', req.body); // Log request body
  console.log('Uploaded file:', req.file); // Log uploaded file

  const { userId } = req.body;

  // Check if the file is uploaded
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ success: false, message: 'No report file uploaded' });
  }

  try {
    const result = await savePairReport(userId, req.file.buffer);  // Pass the buffer correctly
    console.log('Pair comparison report uploaded successfully:', result);  // Log the result
    res.json({ success: true, message: 'Pair comparison report uploaded successfully!', reportId: result._id });
  } catch (error) {
    console.error('Error uploading pair comparison report:', error);
    res.status(500).json({ success: false, message: 'Error uploading pair comparison report' });
  }
});






// Existing route to fetch uploaded PDF reports
app.get('/uploaded-reports', async (req, res) => {
  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'reports' });

    const files = await db.collection('reports.files').find().toArray();

    const reportList = files.map(file => ({
      id: file._id,
      fileName: file.filename,
      date: file.uploadDate,
      reportUrl: `http://localhost:${PORT}/report/${file._id}` // Use dynamic port
    }));

    res.json(reportList); // Return list of uploaded reports
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// Existing user and report fetching routes
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const db = await dbPromise;
    const user = await db.collection('User_Credentials').findOne({ _id: new mongoose.Types.ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ email: user.emailid });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
});

app.get('/user-reports/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await dbPromise;
    const reports = await db.collection('reports.files').find({ 'metadata.userId': new mongoose.Types.ObjectId(userId) }).toArray();
    const pairReports = await db.collection('pair_reports.files').find({ 'metadata.userId': new mongoose.Types.ObjectId(userId) }).toArray();

    const reportList = reports.map(file => ({
      id: file._id,
      fileName: file.filename,
      date: file.uploadDate,
      reportUrl: `http://localhost:${PORT}/report/${file._id}`
    }));

    const pairReportList = pairReports.map(file => ({
      id: file._id,
      fileName: file.filename,
      date: file.uploadDate,
      reportUrl: `http://localhost:${PORT}/pair-report/${file._id}`
    }));

    res.json({ reports: reportList, pairReports: pairReportList });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// Existing endpoint to fetch a specific report
app.get('/report/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'reports' });

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

    downloadStream.on('error', (error) => {
      console.error('Error fetching report:', error);
      res.status(500).json({ success: false, message: 'Error fetching report' });
    });

    // Set the correct content type and pipe the file to the response
    res.set('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
  }
});

app.get('/pair-report/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'pair_reports' });

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

    downloadStream.on('error', (error) => {
      console.error('Error fetching report:', error);
      return res.status(404).json({ success: false, message: 'File not found' });
    });

    // Set headers for PDF response
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename=${id}.pdf`); // Change 'attachment' to 'inline'

    downloadStream.pipe(res).on('finish', () => {
      console.log('Download completed successfully');
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
  }
});



app.get('/user-pair-reports/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'pair_reports' });

    const files = await db.collection('pair_reports.files').find({ 'metadata.userId': new mongoose.Types.ObjectId(userId) }).toArray();

    //const pairReportList = files.filter(file => file.filename.includes('pair')); // Adjust filter as needed

    const reportList = pairReportList.map(file => ({
      id: file._id,
      fileName: file.filename,
      date: file.uploadDate,
      reportUrl: `http://localhost:${PORT}/pair-report/${file._id}`
    }));

    res.json(reportList);
  } catch (error) {
    console.error('Error fetching pair comparison reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching pair comparison reports' });
  }
});



const pythonScriptPath = 'process_audio.py';

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    console.log('Received file:', file);
    const filePath = file.path;

    // Log before starting the Python process
    console.log('Starting Python process...');
    
    const pythonProcess = spawn('python', [pythonScriptPath, filePath]  ,{ timeout: 600000 });

    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error output:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      console.log('Python Output:', pythonOutput);  // Log output from Python script

      try {
        const similarClips = JSON.parse(pythonOutput);
        console.log('Similarity results:', similarClips);
        res.json({ success: true, similarClips: similarClips });
      } catch (error) {
        console.error('Error parsing Python output:', error);
        res.status(500).json({ success: false, message: 'Error processing audio' });
      }
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

app.get('/audio', (req, res) => {
  // Replace backslashes with forward slashes to standardize for URL
  const filePath = req.query.path.replace(/\\/g, '/');

  // Resolve the path on the server side to ensure accessibility
  const resolvedPath = path.resolve(filePath);

  res.sendFile(resolvedPath, (err) => {
      if (err) {
          console.error('Error sending file:', err);
          res.status(404).send('File not found');
      }
  });
});

app.post('/upload2', upload.fields([
  { name: 'file1', maxCount: 1 },
  { name: 'file2', maxCount: 1 }
]), (req, res) => {
  try {
    const files = req.files;

    if (!files['file1'] || !files['file2']) {
      return res.status(400).json({ success: false, message: 'Both files are required' });
    }

    const filePath1 = files['file1'][0].path;
    const filePath2 = files['file2'][0].path;

    console.log('Stored file paths:', filePath1, filePath2); // Log file paths on the server side

    const pythonProcess = spawn('python', [path.join(__dirname, 'siamese_model.py'), filePath1, filePath2]);

    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error output:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      console.log('Raw Python output:', pythonOutput);

      const startMarker = "START_JSON_OUTPUT";
      const endMarker = "END_JSON_OUTPUT";
      const startIndex = pythonOutput.indexOf(startMarker);
      const endIndex = pythonOutput.indexOf(endMarker);

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = pythonOutput.substring(startIndex + startMarker.length, endIndex).trim();

        try {
          const result = JSON.parse(jsonString);
          console.log('Comparison result:', result);

          // Return the file paths and comparison result in the response
          res.json({
            success: true,
            result,
            filePaths: {
              file1: filePath1.replace('server/', ''), // Adjust paths for frontend access
              file2: filePath2.replace('server/', '')
            }
          });
        } catch (error) {
          console.error('Error parsing JSON output:', error);
          res.status(500).json({ success: false, message: 'Invalid JSON output from Python script' });
        }
      } else {
        res.status(500).json({ success: false, message: 'No valid JSON output found' });
      }
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ success: false, message: 'Error processing files' });
  }
});


// Fetch reports from GridFS using the existing database connection
app.get('/reports/:genre/:pairIndex', async (req, res) => {
  const { genre, pairIndex } = req.params;
  const fileName = `${genre}${pairIndex}`; // Ensure this matches your upload naming pattern
  console.log(`Fetching report for file: ${fileName}`);

  try {
    const db = await dbPromise; // Ensure dbPromise resolves to the database instance itself

    const bucket = new GridFSBucket(db, { bucketName: 'pdfReports' });

    const file = await db.collection('pdfReports.files').findOne({ filename: fileName });
    if (!file) {
      console.error(`File not found: ${fileName}`);
      return res.status(404).json({ error: 'Report not found' });
    }

    const readStream = bucket.openDownloadStream(file._id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}.pdf"`, // Append .pdf to filename
    });
    readStream.pipe(res);

    readStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({ error: 'Error streaming file' });
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Error fetching report' });
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

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
      metadata: { userId: new ObjectId(userId) }
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


app.post('/upload-report', uploadMemory.single('report'), async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await saveReport(userId, req.file.buffer);
    res.json({ success: true, message: 'Report uploaded successfully!', reportId: result._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading report' });
  }
});


app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const db = await dbPromise;
    const user = await db.collection('User_Credentials').findOne({ _id: new ObjectId(userId) });

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

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const db = await dbPromise;
    const reports = await db.collection('reports.files').find({ 'metadata.userId': new ObjectId(userId) }).toArray();

    const reportData = reports.map(report => ({
      id: report._id,
      date: report.uploadDate,
      fileName: report.filename,
      reportUrl: `/report/${report._id}`
    }));

    res.json(reportData);
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ success: false, message: 'Error fetching report history' });
  }
});


app.get('/report/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'reports' });

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    downloadStream.on('error', (error) => {
      console.error('Error fetching report:', error);
      res.status(500).json({ success: false, message: 'Error fetching report' });
    });

    res.set('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
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

app.post('/upload2', upload.fields([{ name: 'file1' }, { name: 'file2' }]), async (req, res) => {
  try {
    const files = req.files;

    if (!files['file1'] || !files['file2']) {
      return res.status(400).json({ success: false, message: 'Both files are required' });
    }

    const filePath1 = files['file1'][0].path;
    const filePath2 = files['file2'][0].path;

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
      console.log('Python Output:', pythonOutput);

      // Extract JSON part from the output
      const jsonOutput = pythonOutput.match(/\{.*\}/s);
      if (jsonOutput) {
        try {
          const comparisonResult = JSON.parse(jsonOutput[0]);
          console.log('Comparison results:', comparisonResult);
          res.json({ success: true, similarity_scores: comparisonResult.similarity_scores });
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ success: false, message: 'Error processing files' });
        }
      } else {
        console.error('No valid JSON output found');
        res.status(500).json({ success: false, message: 'No valid JSON output from Python script' });
      }
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ success: false, message: 'Error processing files' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

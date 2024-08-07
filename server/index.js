const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // To load the environment variables from the .env file
const { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } = require('mongodb');
const bcrypt = require('bcrypt');
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

// Upload files route
app.post('/upload', upload.array('files', 2), (req, res) => {
  try {
    res.json({ message: 'Files uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(400).send('Error uploading files');
  }
});

// Save report function
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
      reject('Error uploading report');
    })
    .on('finish', (result) => {
      resolve(result);
    });
  });
}

// Upload report route
app.post('/upload-report', uploadMemory.single('report'), async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await saveReport(userId, req.file.buffer);
    res.json({ success: true, message: 'Report uploaded successfully!', reportId: result._id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading report' });
  }
});

// Fetch user details
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

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

// Fetch user report history
app.get('/user-reports/:userId', async (req, res) => {
  const { userId } = req.params;

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

// Serve report files
app.get('/report/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await dbPromise;
    const bucket = new GridFSBucket(db, { bucketName: 'reports' });

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    res.set('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

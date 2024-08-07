const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

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

    res.json({ success: true });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

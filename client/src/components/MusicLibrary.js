import React from 'react';
import './MusicLibrary.css';

const genres = {
  pop: {
    color: '#ff007f', // Custom color for Pop (used for text or borders if needed)
    pairBackground: 'https://cdn.vectorstock.com/i/1000v/01/94/music-notes-on-maroon-background-vector-5810194.jpg', // Background image for each Pop pair
    songs: [
      { id: 1, title: "Already Gone", artist: "Kelly Clarkson", poster: "https://m.media-amazon.com/images/M/MV5BMGFlZjdlMzAtMWQzYy00NGNmLThiMTYtMTZkNzU1YWYxYjMyXkEyXkFqcGc@._V1_QL75_UX190_CR0,0,190,190_.jpg", url: "/POP/Already gone_B1.mp3" },
      { id: 2, title: "Halo", artist: "Beyonce", poster: "https://m.media-amazon.com/images/I/61rRaGvLBIL.jpg", url: "/POP/Halo_B2.mp3" },
      { id: 3, title: "Tik Tok", artist: "Kesha", poster: "https://m.media-amazon.com/images/I/811RHm3OthL._AC_UF350,350_QL80_.jpg", url: "/POP/Tik Tok_D1.mp3" },
      { id: 4, title: "California Gurls", artist: "Katy Perry (ft. Snoop Dogg)", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz5yJSb4VeU9uFuGfjvSHkNT1TVaP_67vquA&s", url: "/POP/California gurls_D2.mp3" },
      // More songs for Pop
    ]
  },
  rock: {
    color: 'white', // Custom color for Rock
    pairBackground: 'https://img.freepik.com/premium-photo/red-abstract-technology-background-music-abstract-wave_518816-983.jpg', // Background image for each Rock pair
    songs: [
      { id: 5, title: "Satisfaction", artist: "The Rolling Stones", poster: "https://i.pinimg.com/736x/15/b7/ce/15b7cea0149862b4d61960b38317c1be.jpg", url: "/ROCK/Satisifaction_A1.mp3" },
      { id: 6, title: "Jet", artist: "Paul McCartney & Wings", poster: "https://upload.wikimedia.org/wikipedia/en/8/84/Jet_-_Paul_McCartney_%26_Wings.jpg", url: "/ROCK/Jet_A2.mp3" },
      { id: 7, title: "Eighties Coming", artist: "Killing Joke", poster: "https://upload.wikimedia.org/wikipedia/en/e/e5/Eighties_12%22_1984.jpg", url: "/ROCK/Eighties coming_C1.mp3" },
      { id: 8, title: "Come as You Are", artist: "Nirvana", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6KM0zJVJuY0v9S0yxEUgAn9LlDDYhrN0ETQ&s", url: "/ROCK/Come as you are_C2.mp3" },
      // More songs for Rock
    ]
  },
  classical: {
    color: '#ffcc00', // Custom color for Classical
    pairBackground: 'https://t3.ftcdn.net/jpg/08/54/32/86/360_F_854328642_NwSNeYiVCQSHRnJ9WzoQR1kF0RqmOKm8.jpg', // Background image for each Classical pair
    songs: [
      { id: 9, title: "The Nutcracker - Marche", artist: "Tchaikovsky", poster: "https://i.scdn.co/image/ab67616d00001e02f1972145094112a1268035f1", url: "/classical/Tchaikovsky - The Nutcracker - Marche_A1.mp3" },
      { id: 10, title: "Nut Rocker", artist: "B.Bumble & The Stingers", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShNfIBKv8n42hIUzDzxG0pdymHD0aosVwIkA&s", url: "/classical/B.Bumble & The Stingers - Nut Rocker_A2.mp3" },
      { id: 11, title: "A Whiter Shade of Pale", artist: "Procol Harum", poster: "https://m.media-amazon.com/images/I/61rOC5OPccL._UF894,1000_QL80_.jpg", url: "/classical/A Whiter Shade of Pale (Procol Harum) 1967 with lyric_C1.mp3" },
      { id: 12, title: "Air on the G String", artist: "Hauser", poster: "https://cdns-images.dzcdn.net/images/cover/9c4549b75e92712beb20ea6248dbc781/1900x1900-000000-80-0-0.jpg", url: "/classical/HAUSER - Air on the G String (J. S. Bach)_C2.mp3" },
      // More songs for Classical
    ]
  },
  bolly: {
    color: '#28a745', // Custom color for English vs Bollywood
    pairBackground: 'https://cdn.vectorstock.com/i/1000v/04/81/orange-music-background-vector-2370481.jpg', // Background image for each English vs Bollywood pair
    songs: [
      { id: 13, title: "I Just Called To Say I Love You", artist: "Stevie Wonder", poster: "https://c8.alamy.com/comp/2H3P2TG/vintage-vinyl-recording-wonder-stevie-i-just-called-to-say-i-love-you-f-1984-2H3P2TG.jpg", url: "/bolly/I Just Called To Say I Love You - Stevie Wonder (Lyrics)_A2.mp3" },
      { id: 14, title: "Aate Jaate Haste Gaate (Maine Pyar Kiya)", artist: "Lata Mangeshkar and S.P. Balasubrahmanyam", poster: "https://www.makemykaraoke.com/images/detailed/52/Maine_Pyar_Kiya-Aate_Jaate_Hanste_Gaate_17sw-0k.jpg", url: "/bolly/Aate Jaate Haste Gaate - Maine Pyar Kiya - Salman Khan & Bhagyashree - Evergreen Romantic Song_A2.mp3" },
      { id: 15, title: "Nemam Elana", artist: "Dara Bubamara", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2ZCgIyaCY8Yik8zeorruB9krGH3iOKKYL8g&s", url: "/bolly/Dara Bubamara - Nemam elana - (Audio 2010)_A4.mp3" },
      { id: 16, title: "Yeh Ishq Hai  Jab We Met", artist: "Pritam Chakraborty and Shreya Ghoshal", poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoyKA-aWwSH7mUJ3rNVOmPPyHTuvmb__2_28vPSWA4Y4zpfxMFOc0vnygBCnPNKsIw5rQ&usqp=CAU", url: "/bolly/Full Video_ Yeh Ishq Hai  Jab We Met  Kareena Kapoor, Shahid Kapoor  Pritam  Shreya Ghoshal_A4.mp3" },
      // More songs for English vs Bollywood
    ]
  }
};

// Helper function to group songs in pairs
const getSongPairs = (songs) => {
  const pairs = [];
  for (let i = 0; i < songs.length; i += 2) {
    const pair = [songs[i], songs[i + 1]];
    pairs.push(pair);
  }
  return pairs;
};

const MusicLibrary = () => {

  const handleReportClick = (genre, index) => {
    const url = `http://localhost:5000/reports/${genre}/${index + 1}`; // Make sure this matches how you're naming your files in the backend
    console.log("Fetching report from URL:", url);
    window.open(url, '_blank'); // This will open the PDF in a new tab
  };
  


  return (
    <div className="music-library-container">
      <h1>Music Library</h1>
      <p>Browse through genres and check similarity reports for song pairs!</p>

      {Object.entries(genres).map(([genre, { color, pairBackground, songs }]) => {
        const songPairs = getSongPairs(songs);

        return (
          <div key={genre} className="genre-section" style={{ color }}>
            <h2>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
            <div className="music-library-grid">
              {songPairs.map((pair, index) => (
                <div className="music-library-pair" key={index} style={{ backgroundImage: `url(${pairBackground})`, backgroundSize: 'cover' }}>
                  {pair.map((song) => (
                    <div className="music-library-card" key={song.id}>
                      <img src={song.poster} alt={`${song.title} Poster`} className="music-poster" />
                      <p>{song.artist}</p>
                      <p>{song.title}</p>
                      <audio controls className="music-library-audio">
                        <source src={song.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ))}
                  <div className="button-group">
  
                    <button
                      className="music-library-similarity-button"
                      onClick={() => handleReportClick(genre, index)}
                    >
                      Pair Comparison Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};


export default MusicLibrary;

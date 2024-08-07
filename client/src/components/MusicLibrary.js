import React from 'react';
import './MusicLibrary.css'; // Import the CSS file for styling

const songs = [
  { id: 1, title: "That's My Name", url: "/audio/A1_that's_my_name.mp3" },
  { id: 2, title: "Stereo Love", url: "/audio/A2_stereo_love_ringtone (1).mp3" },
  { id: 3, title: "Treasure - Bruno Mars", url: "/audio/J1_Bruno Mars - Treasure (Official Instrumental).mp3" },
  { id: 4, title: "Baby I'm Yours", url: "/audio/J2_Baby I'm Yours (minus).mp3" },
  { id: 5, title: "Roar", url: "/audio/G1_Katy-Perry-Roar-Instrumental-Prod.-By-Cirkut-Dr.-Luke-Max-Martin.mp3" },
  { id: 6, title: "Brave", url: "/audio/G2_Brave.mp3" },
  { id: 7, title: "Haunted", url: "/audio/H1_Taylor-Swift-Haunted-Instrumental-Prod.-By-Nathan-Chapman-Taylor-Swift.mp3" },
  { id: 8, title: "The Scientist Done", url: "/audio/H2_The scientist done.mp3" },
  { id: 9, title: "Ye Ishq Hai", url: "/audio/M1_Ye Ishq Hai.mp3" },
  { id: 10, title: "In Your Mind", url: "/audio/M2_in your mind.mp3" },
  { id: 11, title: "California Gurls", url: "/audio/P1_California_Gurls.mp3" },
  { id: 12, title: "The Cowsills", url: "/audio/P2_Cowsills.mp3" },
  { id: 13, title: "Spirit", url: "/audio/S1_Spirit.mp3" },
  { id: 14, title: "Stairway To Heaven", url: "/audio/S2_Stairway_To_Heaven.mp3" },
  { id: 15, title: "Bitter Sweet", url: "/audio/T1_Bitter_Sweet.mp3" },
  { id: 16, title: "The Last Time", url: "/audio/T2_The_Last_Time.mp3" },
];

const MusicLibrary = () => {
  return (
    <div className="music-library-container">
      <h1>Music Library</h1>
      <p>Welcome to the music library page!</p>
      <div className="music-library-song-pairs">
        {songs.map((song, index) => (
          <div
            className={`music-library-pair-box ${Math.floor(index / 2) < 4 ? 'music-library-bg-color-blue' : 'music-library-bg-color-pink'}`}
            key={song.id}
          >
            <div className="music-library-song">
              <audio controls className="music-library-audio">
                <source src={song.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p>{song.title}</p>
            </div>
            {index % 2 === 1 && (
              <button className="music-library-similarity-button">Check Similarity</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicLibrary;

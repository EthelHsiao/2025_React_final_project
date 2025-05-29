import React from 'react';
import { Song } from '../../types'; // 正確的路徑

interface SuitableSongsListProps {
  songs: Song[];
}

const SuitableSongsList: React.FC<SuitableSongsListProps> = ({ songs }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      backgroundColor: '#f9f9f9',
      minWidth: '250px',
      flex: 1 
    }}>
      <h4>適合歌曲</h4>
      {songs && songs.length > 0 ? (
        <ul style={{ listStyleType: 'decimal', paddingLeft: '20px'}}>
          {songs.map(song => (
            <li key={song.id} style={{ marginBottom: '8px' }}>
              <strong>{song.title}</strong> - {song.artist} ({song.primaryGenre})
            </li>
          ))}
        </ul>
      ) : (
        <p>暫無推薦歌曲</p>
      )}
    </div>
  );
};

export default SuitableSongsList; 
import React from 'react';

interface SpecialTonesCardProps {
  tones: string[];
}

const SpecialTonesCard: React.FC<SpecialTonesCardProps> = ({ tones }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      backgroundColor: '#f9f9f9',
      minWidth: '250px',
      flex: 1 
    }}>
      <h4>特色音調</h4>
      {tones && tones.length > 0 ? (
        <ul>
          {tones.map((tone, index) => (
            <li key={index}>{tone}</li>
          ))}
        </ul>
      ) : (
        <p>暫無特色音調分析</p>
      )}
    </div>
  );
};

export default SpecialTonesCard;

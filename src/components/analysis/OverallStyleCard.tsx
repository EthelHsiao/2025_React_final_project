import React from 'react';

interface OverallStyleCardProps {
  styleDescription: string;
}

const OverallStyleCard: React.FC<OverallStyleCardProps> = ({ styleDescription }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      backgroundColor: '#f9f9f9',
      minWidth: '250px', 
      flex: 1 
    }}>
      <h4>整體曲風音調</h4>
      <p>{styleDescription || '暫無分析結果'}</p>
    </div>
  );
};

export default OverallStyleCard; 
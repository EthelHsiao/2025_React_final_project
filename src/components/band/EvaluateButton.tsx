import React from 'react';

interface EvaluateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  bandIsReady: boolean; // 是否至少有一個成員，或者符合評估條件
}

const EvaluateButton: React.FC<EvaluateButtonProps> = ({ onClick, disabled, bandIsReady }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      {/* 示意圖可以放這裡，或者直接是按鈕 */}
      <img 
        src="https://via.placeholder.com/200x100.png?text=卡牌堆疊示意圖" 
        alt="Deck of cards icon" 
        style={{ marginBottom: '10px', width: '150px'}} 
      />
      <button 
        onClick={onClick} 
        disabled={disabled || !bandIsReady}
        style={{
          padding: '12px 25px',
          fontSize: '1.2em',
          backgroundColor: (disabled || !bandIsReady) ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: (disabled || !bandIsReady) ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        開始評估！
      </button>
      {!bandIsReady && <p style={{color: 'red', fontSize: '0.9em', marginTop: '5px'}}>請至少為樂隊選擇一位成員才能評估。</p>}
    </div>
  );
};

export default EvaluateButton; 
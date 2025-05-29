import React from 'react';

const AssembleBandPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="assemble-band-page-layout">
        <h2>樂隊組建與分析</h2>
        <p>在這裡，您可以從您建立的音樂家池中選擇成員，將他們拖曳到下方的樂隊位置中。</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
          <section style={{ flex: '2 1 60%' }} aria-labelledby="band-assembly-title">
            <h3 id="band-assembly-title">角色池 (Band Slots)</h3>
            <div style={{ border: '2px dashed var(--border-color)', padding: '20px', minHeight: '250px', backgroundColor: 'var(--card-slot-background)', borderRadius: 'var(--border-radius)' }}>
              樂隊成員位置區域 (預計六個卡槽)
            </div>
            <h4 style={{marginTop: '20px'}}>音樂家池 (Available Musicians)</h4>
            <div style={{ border: '1px solid var(--border-color)', padding: '15px', minHeight: '200px', marginTop: '10px', borderRadius: 'var(--border-radius)', backgroundColor: '#fff' }}>
              可拖曳的音樂家卡牌列表區域
            </div>
          </section>
          <section style={{ flex: '1 1 35%' }} aria-labelledby="analysis-title">
            <h3 id="analysis-title">分析結果</h3>
            <div style={{ border: '1px solid var(--border-color)', padding: '20px', minHeight: '350px', borderRadius: 'var(--border-radius)', backgroundColor: '#fff' }}>
              整體曲風音調、特色音調、適合歌曲等分析結果顯示區域。
              <button style={{ marginTop: '20px' }} className="btn btn-primary">開始評估！</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AssembleBandPage; 
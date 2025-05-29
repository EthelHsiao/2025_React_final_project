import React from 'react';
import { FrontendAnalysisData } from '../../types'; // 修正路徑
import OverallStyleCard from './OverallStyleCard';
import SpecialTonesCard from './SpecialTonesCard';
import SuitableSongsList from './SuitableSongsList';

interface AnalysisResultDisplayProps {
  analysisData: FrontendAnalysisData | null;
  isLoading: boolean;
}

const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ analysisData, isLoading }) => {
  if (isLoading) {
    return <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.1em' }}>正在分析樂隊，請稍候...</p>;
  }

  if (!analysisData) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>點擊「開始評估」以查看分析結果。</p>;
  }

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>分析結果</h2>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <OverallStyleCard styleDescription={analysisData.overallStyle} />
        <SpecialTonesCard tones={analysisData.specialTones} />
        <SuitableSongsList songs={analysisData.suitableSongs} />
      </div>
    </div>
  );
};

export default AnalysisResultDisplay; 
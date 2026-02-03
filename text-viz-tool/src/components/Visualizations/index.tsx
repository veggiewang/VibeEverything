import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { WordCloudVisualization } from './WordCloud';
import { TimelineVisualization } from './Timeline';
import { ChartsVisualization } from './Charts';
import { FlowchartVisualization } from './Flowchart';
import { MindMapVisualization } from './MindMap';
import { CalendarVisualization } from './Calendar';
import { PhotoWallVisualization } from './PhotoWall';

export const VisualizationContainer: React.FC = () => {
  const { currentVisualization } = useAppStore();

  if (!currentVisualization) {
    return null;
  }

  switch (currentVisualization) {
    case 'wordcloud':
      return <WordCloudVisualization />;
    case 'timeline':
      return <TimelineVisualization />;
    case 'chart':
      return <ChartsVisualization />;
    case 'flowchart':
      return <FlowchartVisualization />;
    case 'mindmap':
      return <MindMapVisualization />;
    case 'calendar':
      return <CalendarVisualization />;
    case 'photowall':
      return <PhotoWallVisualization />;
    default:
      return null;
  }
};

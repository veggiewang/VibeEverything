declare module 'wordcloud' {
  interface WordCloudOptions {
    list: [string, number][];
    gridSize?: number;
    weightFactor?: number;
    fontFamily?: string;
    color?: string | (() => string);
    rotateRatio?: number;
    backgroundColor?: string;
    minSize?: number;
  }

  function WordCloud(
    canvas: HTMLCanvasElement,
    options: WordCloudOptions
  ): void;

  export = WordCloud;
}

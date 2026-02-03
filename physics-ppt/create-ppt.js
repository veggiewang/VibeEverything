const PptxGenJS = require('pptxgenjs');

// 创建新的演示文稿
const pptx = new PptxGenJS();

// 设置演示文稿属性
pptx.author = 'Claude';
pptx.title = '能量与功率';
pptx.subject = '物理学基础概念';
pptx.layout = 'LAYOUT_16x9';

// 定义颜色方案 - 科技蓝色主题
const colors = {
  primary: '1E3A5F',      // 深蓝色
  secondary: '3498DB',     // 亮蓝色
  accent: 'E74C3C',        // 红色强调
  light: 'ECF0F1',         // 浅灰色
  white: 'FFFFFF',
  dark: '2C3E50'
};

// 创建幻灯片
const slide = pptx.addSlide();

// 设置背景 - 渐变效果通过形状实现
slide.background = { color: colors.light };

// 添加顶部深色标题区域
slide.addShape(pptx.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: '100%',
  h: 1.2,
  fill: { color: colors.primary }
});

// 添加主标题
slide.addText('能量与功率', {
  x: 0.5,
  y: 0.3,
  w: 9,
  h: 0.7,
  fontSize: 36,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

// 添加副标题
slide.addText('物理学基础概念', {
  x: 0.5,
  y: 0.85,
  w: 9,
  h: 0.3,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.secondary
});

// 左侧内容区域 - 能量
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4,
  y: 1.5,
  w: 4.5,
  h: 3.3,
  fill: { color: colors.white },
  shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '888888', opacity: 0.3 },
  rectRadius: 0.1
});

// 能量标题
slide.addText('能量 (Energy)', {
  x: 0.6,
  y: 1.65,
  w: 4.1,
  h: 0.45,
  fontSize: 20,
  fontFace: 'Arial',
  color: colors.primary,
  bold: true
});

// 能量图标/符号
slide.addText('E', {
  x: 3.9,
  y: 1.6,
  w: 0.8,
  h: 0.5,
  fontSize: 28,
  fontFace: 'Times New Roman',
  color: colors.secondary,
  bold: true,
  italic: true
});

// 能量定义
slide.addText('物体做功的能力', {
  x: 0.6,
  y: 2.1,
  w: 4.1,
  h: 0.3,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark
});

// 能量公式框
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.6,
  y: 2.45,
  w: 4.1,
  h: 0.5,
  fill: { color: 'F8F9FA' },
  line: { color: colors.secondary, width: 1 },
  rectRadius: 0.05
});

slide.addText([
  { text: '动能: ', options: { bold: true, color: colors.dark } },
  { text: 'Ek = ½mv²', options: { italic: true, color: colors.accent } }
], {
  x: 0.7,
  y: 2.5,
  w: 3.9,
  h: 0.4,
  fontSize: 12,
  fontFace: 'Arial'
});

// 能量要点
const energyPoints = [
  '单位: 焦耳 (J)',
  '标量, 只有大小没有方向',
  '形式: 动能、势能、热能等',
  '守恒定律: 能量不会凭空产生或消失'
];

slide.addText(energyPoints.map(text => ({ text, options: { bullet: { type: 'bullet', color: colors.secondary }, indentLevel: 0 } })), {
  x: 0.6,
  y: 3.0,
  w: 4.1,
  h: 1.7,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark,
  valign: 'top',
  lineSpacing: 22
});

// 右侧内容区域 - 功率
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 5.1,
  y: 1.5,
  w: 4.5,
  h: 3.3,
  fill: { color: colors.white },
  shadow: { type: 'outer', blur: 6, offset: 2, angle: 45, color: '888888', opacity: 0.3 },
  rectRadius: 0.1
});

// 功率标题
slide.addText('功率 (Power)', {
  x: 5.3,
  y: 1.65,
  w: 4.1,
  h: 0.45,
  fontSize: 20,
  fontFace: 'Arial',
  color: colors.primary,
  bold: true
});

// 功率图标/符号
slide.addText('P', {
  x: 8.6,
  y: 1.6,
  w: 0.8,
  h: 0.5,
  fontSize: 28,
  fontFace: 'Times New Roman',
  color: colors.secondary,
  bold: true,
  italic: true
});

// 功率定义
slide.addText('做功的快慢 (能量转化速率)', {
  x: 5.3,
  y: 2.1,
  w: 4.1,
  h: 0.3,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark
});

// 功率公式框
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 5.3,
  y: 2.45,
  w: 4.1,
  h: 0.5,
  fill: { color: 'F8F9FA' },
  line: { color: colors.secondary, width: 1 },
  rectRadius: 0.05
});

slide.addText([
  { text: '公式: ', options: { bold: true, color: colors.dark } },
  { text: 'P = W/t = Fv', options: { italic: true, color: colors.accent } }
], {
  x: 5.4,
  y: 2.5,
  w: 3.9,
  h: 0.4,
  fontSize: 12,
  fontFace: 'Arial'
});

// 功率要点
const powerPoints = [
  '单位: 瓦特 (W) = J/s',
  '标量, 描述能量转化快慢',
  '常见单位: 千瓦(kW)、马力(hp)',
  '1马力 ≈ 746瓦特'
];

slide.addText(powerPoints.map(text => ({ text, options: { bullet: { type: 'bullet', color: colors.secondary }, indentLevel: 0 } })), {
  x: 5.3,
  y: 3.0,
  w: 4.1,
  h: 1.7,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark,
  valign: 'top',
  lineSpacing: 22
});

// 底部关系说明框
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.4,
  y: 4.9,
  w: 9.2,
  h: 0.5,
  fill: { color: colors.primary },
  rectRadius: 0.05
});

slide.addText('关键关系: 功率 = 能量 ÷ 时间  |  功 = 力 × 位移  |  能量守恒是物理学基本定律', {
  x: 0.5,
  y: 4.95,
  w: 9.0,
  h: 0.4,
  fontSize: 12,
  fontFace: 'Arial',
  color: colors.white,
  align: 'center'
});

// 保存文件
const outputPath = '/home/user/VibeEverything/physics-ppt/能量与功率.pptx';
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`PPT 创建成功: ${fileName}`);
  })
  .catch(err => {
    console.error('创建 PPT 时出错:', err);
  });

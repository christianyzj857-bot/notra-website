# Gemini 3 Nano Banana 插图生成 Prompt

## 总体要求
- 生成高质量的教科书风格插图
- 返回生成图片的代码（SVG/HTML Canvas/React 组件等）
- 图片需要专业、清晰、适合教育用途
- 尺寸：1200x800px（宽高比 3:2）
- 风格：现代教科书插图，干净简洁，有适当的标注和说明

---

## 1. Middle School (初中) - Algebra: Linear Equations

### 文件内容
- **标题**: Algebra: Linear Equations
- **副标题**: Intro to solving for x
- **主题**: 线性方程基础
- **主要内容**: 
  - 基本形式: y = mx + b
  - 斜率 (m) = 变化率
  - y轴截距 (b) = 起始值
  - 解决实际问题中的比例关系

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional textbook-style illustration showing:
- A coordinate plane (x-y graph) with clear axes labeled
- Multiple linear equations graphed as straight lines with different slopes
- Examples: y = 2x + 3 (positive slope), y = -x + 5 (negative slope), y = 0.5x - 2 (gentle slope)
- Each line should be color-coded and labeled with its equation
- Include grid lines for clarity
- Add annotations showing key concepts: slope (rise/run), y-intercept point
- Style: Clean, modern textbook illustration with soft colors (blues, greens, purples)
- Background: Light cream or white
- Include small mathematical notation and labels in a professional font
- Dimensions: 1200x800px, landscape orientation
```

#### 图片 2: 概念图解
**Prompt:**
```
Create a textbook-style diagram showing:
- Visual representation of linear equation components
- Show how slope (m) represents rate of change with arrows
- Illustrate y-intercept (b) as the starting point on y-axis
- Include a real-world example: distance vs time graph for constant speed
- Style: Educational diagram with clear labels and arrows
- Colors: Professional blue and green tones
- Dimensions: 1200x800px
```

---

## 2. High School (高中) - Calculus: Derivatives

### 文件内容
- **标题**: Calculus Chapter 3: Derivatives
- **副标题**: Derivatives
- **主题**: 导数定义和极限
- **主要内容**:
  - 导数定义: f'(x) = lim[h→0] (f(x+h) - f(x))/h
  - 几何意义: 切线的斜率
  - 物理意义: 速度、加速度
  - 瞬时变化率

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional calculus textbook illustration showing:
- A smooth curve (parabola or cubic function) on a coordinate plane
- A tangent line touching the curve at a specific point, clearly labeled
- The secant line approaching the tangent line (showing the limit concept)
- Annotations showing: f(x), f(x+h), h approaching zero
- Include the derivative formula: f'(x) = lim[h→0] [f(x+h) - f(x)]/h
- Visual representation of the limit process with multiple secant lines
- Style: Clean mathematical diagram with professional typography
- Colors: Deep blues and purples for the curve, red for tangent line
- Background: Light gray or white with subtle grid
- Dimensions: 1200x800px
```

#### 图片 2: 导数应用图解
**Prompt:**
```
Create a textbook diagram showing:
- Position-time graph (smooth curve)
- Velocity as the derivative (tangent slopes at different points)
- Acceleration as second derivative
- Show the relationship between position, velocity, and acceleration graphs
- Include arrows and labels explaining the derivative concept
- Style: Educational multi-panel diagram
- Colors: Professional blue, green, and orange for different graphs
- Dimensions: 1200x800px
```

---

## 3. Undergraduate (本科) - Linear Algebra: Eigenvalues & Eigenvectors

### 文件内容
- **标题**: Linear Algebra: Eigenvalues & Eigenvectors
- **副标题**: Matrix transformations
- **主题**: 特征值和特征向量
- **主要内容**:
  - 特征值方程: Av = λv
  - 特征多项式: det(A - λI) = 0
  - 方向保持不变
  - 应用: PCA, 量子力学

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional linear algebra textbook illustration showing:
- 2D vector space with coordinate axes
- A matrix transformation visualized as geometric transformation
- Original vectors in blue, transformed vectors in red
- Highlight eigenvectors (vectors that only scale, don't rotate) in green
- Show eigenvalues as scaling factors (λ₁, λ₂) with annotations
- Include a 2x2 matrix example: A = [[2, 1], [0, 3]]
- Visual representation of Av = λv equation
- Style: Clean geometric diagram with mathematical precision
- Colors: Blue (original), Red (transformed), Green (eigenvectors)
- Background: White with subtle grid
- Include mathematical notation in professional font
- Dimensions: 1200x800px
```

#### 图片 2: 特征值分解图解
**Prompt:**
```
Create a textbook diagram showing:
- Matrix diagonalization concept: A = PDP⁻¹
- Visual representation of eigenvalue decomposition
- Show how eigenvectors form the columns of P
- Eigenvalues on the diagonal of D
- Include geometric interpretation: stretching along eigenvector directions
- Style: Educational diagram with clear mathematical notation
- Colors: Professional purple and pink tones
- Dimensions: 1200x800px
```

---

## 4. Graduate (研究生) - Advanced Calculus: Multivariable Gradients

### 文件内容
- **标题**: Advanced Calculus: Multivariable Gradients
- **副标题**: Vector calculus
- **主题**: 梯度和方向导数
- **主要内容**:
  - 梯度: ∇f = (∂f/∂x, ∂f/∂y, ...)
  - 方向导数: D_u f = ∇f · u
  - 最陡上升方向
  - 应用: 优化、机器学习

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional multivariable calculus textbook illustration showing:
- A 3D surface plot (like a mountain/hill) representing f(x,y)
- Contour lines (level curves) on the x-y plane below
- Gradient vectors (arrows) pointing in the direction of steepest ascent
- Multiple gradient vectors at different points, all perpendicular to contour lines
- Include the gradient formula: ∇f = (∂f/∂x, ∂f/∂y)
- Show how gradient magnitude represents rate of change
- Style: Clean 3D mathematical visualization with professional rendering
- Colors: Gradient from blue (low) to red (high) for the surface
- Gradient vectors in bright green or yellow
- Background: Light gray with subtle grid
- Include mathematical notation and labels
- Dimensions: 1200x800px
```

#### 图片 2: 方向导数图解
**Prompt:**
```
Create a textbook diagram showing:
- A function f(x,y) with contour lines
- A point P on the surface
- Multiple direction vectors (u₁, u₂, u₃) from point P
- Show how directional derivative D_u f = ∇f · u varies with direction
- Highlight the direction of maximum increase (gradient direction)
- Include visual representation of the dot product concept
- Style: Educational 2D diagram with clear annotations
- Colors: Professional blue and green tones
- Dimensions: 1200x800px
```

---

## 5. Working Professional (职场人士) - Q2 Sales Report

### 文件内容
- **标题**: Q2 Sales Report – TechCorp
- **副标题**: Business performance briefing
- **主题**: 商业报告和数据分析
- **主要内容**:
  - Q2 2024: 23% 收入增长 YoY
  - 企业销售: +35% 增长
  - 客户留存率: 92%
  - 收入: $12.5M

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional business report illustration showing:
- Modern dashboard-style data visualization
- Multiple charts: bar chart showing revenue growth (23% YoY), line chart for quarterly trends
- Pie chart showing revenue breakdown: Enterprise (68%), SMB (26%), Consumer (6%)
- Key metrics displayed prominently: $12.5M total revenue, 92% retention rate
- Professional business color scheme: blues, grays, and accent colors (green for growth)
- Clean, corporate design with subtle shadows and gradients
- Include icons for: revenue, growth, customers, regions
- Style: Modern business analytics dashboard, similar to Tableau or Power BI
- Background: Light gray or white with subtle grid
- Typography: Professional sans-serif font
- Dimensions: 1200x800px
```

#### 图片 2: 商业指标可视化
**Prompt:**
```
Create a business report diagram showing:
- Regional performance comparison (Asia-Pacific: +45%, North America: +15%, Europe: +8%)
- Customer metrics: retention rate (92%), NPS score (72)
- Sales funnel or customer journey visualization
- Growth trends with upward arrows and percentages
- Professional infographic style with icons and data visualizations
- Colors: Corporate blue, green for positive metrics, professional grays
- Style: Clean business presentation graphics
- Dimensions: 1200x800px
```

---

## 6. Educator (教育者) - Teaching Strategies for Active Learning

### 文件内容
- **标题**: Teaching Strategies for Active Learning
- **副标题**: Textbook chapter sample
- **主题**: 主动学习教学策略
- **主要内容**:
  - Think-pair-share: 个人 → 配对 → 班级讨论
  - 问题导向学习: 真实场景
  - 同伴教学: 学生互教
  - 提高参与度和知识保留

### 需要生成的图片

#### 图片 1: 顶部主图（Hero Image）
**Prompt:**
```
Create a professional educational textbook illustration showing:
- A classroom layout diagram showing active learning in action
- Students arranged in pairs/groups (not traditional rows)
- Visual flow: Individual thinking → Pair discussion → Class sharing
- Icons representing different learning activities: thinking, discussion, collaboration
- Include labels: "Think-Pair-Share" methodology
- Show engagement indicators: students with thought bubbles, discussion arrows
- Style: Clean educational diagram with warm, inviting colors
- Colors: Soft blues, greens, and oranges (educational, friendly palette)
- Background: Light cream or white
- Include educational icons and labels
- Dimensions: 1200x800px
```

#### 图片 2: 学习策略流程图
**Prompt:**
```
Create a textbook diagram showing:
- Flowchart of active learning strategies
- Steps: Problem-based learning → Peer instruction → Collaborative projects
- Visual representation of student engagement levels
- Comparison: Traditional lecture vs Active learning (side by side)
- Include icons for: discussion, problem-solving, collaboration, reflection
- Style: Educational infographic with clear flow and hierarchy
- Colors: Professional orange and red tones (energetic, engaging)
- Dimensions: 1200x800px
```

---

## 代码格式要求

请为每张图片生成以下格式之一的代码：

### 选项 1: React 组件 (推荐)
```tsx
export const ImageName = () => {
  return (
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      {/* SVG content */}
    </svg>
  );
};
```

### 选项 2: SVG 文件
```svg
<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <!-- SVG content -->
</svg>
```

### 选项 3: HTML Canvas (如果 SVG 不够用)
```tsx
export const ImageName = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Canvas drawing code
  }, []);
  
  return <canvas ref={canvasRef} width={1200} height={800} />;
};
```

---

## 输出要求

对于每个身份，请提供：
1. 图片 1 (顶部主图) 的完整代码
2. 图片 2 (概念图解) 的完整代码
3. 代码应该可以直接在 React/Next.js 项目中使用
4. 如果使用 SVG，确保所有文本、路径、颜色都是可编辑的
5. 代码需要包含适当的注释说明各部分的作用

---

## 注意事项

- 所有图片必须符合教科书质量标准
- 数学公式和符号需要清晰可读
- 商业图表需要专业、现代的设计
- 教育图表需要清晰、易懂
- 颜色搭配要专业且不刺眼
- 确保代码可以在浏览器中正确渲染


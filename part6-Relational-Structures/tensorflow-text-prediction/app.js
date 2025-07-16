class TextPredictor {
    constructor() {
        this.model = null;
        this.chars = [];
        this.charToIndex = {};
        this.indexToChar = {};
        this.sequenceLength = 40;
        this.isTraining = false;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('trainBtn').addEventListener('click', () => this.trainModel());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateText());
        
        // 添加默认训练文本
        const defaultText = `Hello world! How are you today? Programming is fun and exciting.
Machine learning with TensorFlow.js is amazing! Let's build something cool.
This is a simple text prediction example. We can train a neural network to learn patterns.
The model will learn character-level patterns and generate new text based on input.
Artificial intelligence is transforming how we work and live. Technology is advancing rapidly.
Deep learning models can understand and generate human-like text with proper training.`;
        
        document.getElementById('trainingText').value = defaultText;
    }
    
    preprocessText(text) {
        // 获取所有唯一字符
        this.chars = [...new Set(text)].sort();
        this.charToIndex = {};
        this.indexToChar = {};
        
        this.chars.forEach((char, index) => {
            this.charToIndex[char] = index;
            this.indexToChar[index] = char;
        });
        
        return this.chars.length;
    }
    
    createSequences(text) {
        const sequences = [];
        const nextChars = [];
        
        for (let i = 0; i <= text.length - this.sequenceLength - 1; i++) {
            const sequence = text.substr(i, this.sequenceLength);
            const nextChar = text[i + this.sequenceLength];
            
            sequences.push(sequence);
            nextChars.push(nextChar);
        }
        
        return { sequences, nextChars };
    }
    
    vectorizeData(sequences, nextChars) {
        const X = tf.zeros([sequences.length, this.sequenceLength, this.chars.length]);
        const y = tf.zeros([sequences.length, this.chars.length]);
        
        const xData = X.dataSync();
        const yData = y.dataSync();
        
        for (let i = 0; i < sequences.length; i++) {
            for (let j = 0; j < this.sequenceLength; j++) {
                const charIndex = this.charToIndex[sequences[i][j]];
                const xIndex = i * this.sequenceLength * this.chars.length + 
                              j * this.chars.length + charIndex;
                xData[xIndex] = 1;
            }
            
            const nextCharIndex = this.charToIndex[nextChars[i]];
            const yIndex = i * this.chars.length + nextCharIndex;
            yData[yIndex] = 1;
        }
        
        return { X, y };
    }
    
    createModel() {
        const model = tf.sequential();
        
        // LSTM层
        model.add(tf.layers.lstm({
            units: 128,
            returnSequences: true,
            inputShape: [this.sequenceLength, this.chars.length]
        }));
        
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        model.add(tf.layers.lstm({
            units: 128,
            returnSequences: false
        }));
        
        model.add(tf.layers.dropout({ rate: 0.2 }));
        
        // 输出层
        model.add(tf.layers.dense({
            units: this.chars.length,
            activation: 'softmax'
        }));
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    updateStatus(message, type = '') {
        const statusElement = document.getElementById('trainStatus');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }
    
    updateModelInfo() {
        const modelInfoElement = document.getElementById('modelInfo');
        if (this.model) {
            modelInfoElement.innerHTML = `
                <p><strong>模型状态:</strong> 已训练</p>
                <p><strong>字符集大小:</strong> ${this.chars.length} 个字符</p>
                <p><strong>序列长度:</strong> ${this.sequenceLength}</p>
                <p><strong>字符集:</strong> ${this.chars.join(', ')}</p>
                <p><strong>模型参数:</strong> ${this.model.countParams().toLocaleString()}</p>
            `;
        }
    }
    
    async trainModel() {
        if (this.isTraining) return;
        
        const trainingText = document.getElementById('trainingText').value.trim();
        if (!trainingText) {
            this.updateStatus('请输入训练文本！', 'error');
            return;
        }
        
        this.isTraining = true;
        document.getElementById('trainBtn').disabled = true;
        document.getElementById('trainBtn').textContent = '训练中...';
        
        try {
            this.updateStatus('正在预处理文本...', 'training');
            
            // 预处理文本
            const vocabSize = this.preprocessText(trainingText);
            console.log(`词汇表大小: ${vocabSize}`);
            
            // 创建序列
            const { sequences, nextChars } = this.createSequences(trainingText);
            console.log(`创建了 ${sequences.length} 个训练序列`);
            
            if (sequences.length < 10) {
                throw new Error('训练文本太短，请输入更多文本');
            }
            
            this.updateStatus('正在准备训练数据...', 'training');
            
            // 向量化数据
            const { X, y } = this.vectorizeData(sequences, nextChars);
            
            this.updateStatus('正在创建模型...', 'training');
            
            // 创建模型
            this.model = this.createModel();
            
            this.updateStatus('开始训练模型...', 'training');
            
            // 训练模型
            const history = await this.model.fit(X, y, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.1,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        const progress = ((epoch + 1) / 50 * 100).toFixed(1);
                        this.updateStatus(
                            `训练进度: ${progress}% (轮次 ${epoch + 1}/50) - 损失: ${logs.loss.toFixed(4)}, 准确率: ${(logs.acc * 100).toFixed(2)}%`,
                            'training'
                        );
                    }
                }
            });
            
            // 清理张量
            X.dispose();
            y.dispose();
            
            this.updateStatus('模型训练完成！', 'success');
            this.updateModelInfo();
            
            // 启用文本生成功能
            document.getElementById('seedText').disabled = false;
            document.getElementById('generateLength').disabled = false;
            document.getElementById('generateBtn').disabled = false;
            
        } catch (error) {
            console.error('训练过程中出错:', error);
            this.updateStatus(`训练失败: ${error.message}`, 'error');
        } finally {
            this.isTraining = false;
            document.getElementById('trainBtn').disabled = false;
            document.getElementById('trainBtn').textContent = '开始训练模型';
        }
    }
    
    sampleFromProbabilities(probabilities, temperature = 1.0) {
        const probs = tf.softmax(tf.div(probabilities, temperature));
        const probsData = probs.dataSync();
        
        // 使用概率分布进行采样
        const cumulative = new Array(probsData.length);
        cumulative[0] = probsData[0];
        for (let i = 1; i < probsData.length; i++) {
            cumulative[i] = cumulative[i - 1] + probsData[i];
        }
        
        const random = Math.random();
        for (let i = 0; i < cumulative.length; i++) {
            if (random <= cumulative[i]) {
                probs.dispose();
                return i;
            }
        }
        
        probs.dispose();
        return probsData.length - 1;
    }
    
    async generateText() {
        if (!this.model) {
            alert('请先训练模型！');
            return;
        }
        
        const seedText = document.getElementById('seedText').value;
        const generateLength = parseInt(document.getElementById('generateLength').value);
        
        if (!seedText) {
            alert('请输入种子文本！');
            return;
        }
        
        if (seedText.length < this.sequenceLength) {
            alert(`种子文本长度必须至少为 ${this.sequenceLength} 个字符！`);
            return;
        }
        
        document.getElementById('generateBtn').disabled = true;
        document.getElementById('generateBtn').textContent = '生成中...';
        
        try {
            let generated = '';
            let currentSequence = seedText.slice(-this.sequenceLength);
            
            for (let i = 0; i < generateLength; i++) {
                // 准备输入数据
                const inputArray = tf.zeros([1, this.sequenceLength, this.chars.length]);
                const inputData = inputArray.dataSync();
                
                for (let j = 0; j < this.sequenceLength; j++) {
                    const char = currentSequence[j];
                    if (char in this.charToIndex) {
                        const charIndex = this.charToIndex[char];
                        const index = j * this.chars.length + charIndex;
                        inputData[index] = 1;
                    }
                }
                
                // 预测下一个字符
                const prediction = this.model.predict(inputArray);
                const probabilities = prediction.squeeze();
                
                // 使用温度采样选择下一个字符
                const nextCharIndex = this.sampleFromProbabilities(probabilities, 0.8);
                const nextChar = this.indexToChar[nextCharIndex];
                
                generated += nextChar;
                currentSequence = currentSequence.slice(1) + nextChar;
                
                // 清理张量
                inputArray.dispose();
                prediction.dispose();
                probabilities.dispose();
                
                // 实时显示生成的文本
                if (i % 5 === 0) {
                    document.getElementById('output').textContent = `种子文本: "${seedText}"\n\n生成的文本:\n${generated}`;
                    await tf.nextFrame(); // 让界面有机会更新
                }
            }
            
            // 显示最终结果
            document.getElementById('output').textContent = `种子文本: "${seedText}"\n\n生成的文本:\n${generated}`;
            
        } catch (error) {
            console.error('生成文本时出错:', error);
            alert(`生成失败: ${error.message}`);
        } finally {
            document.getElementById('generateBtn').disabled = false;
            document.getElementById('generateBtn').textContent = '生成文本';
        }
    }
}

// 当页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('TensorFlow.js版本:', tf.version.tfjs);
    
    // 检查WebGL支持
    if (!tf.ENV.getBool('WEBGL_VERSION')) {
        console.warn('WebGL不可用，将使用CPU模式（可能较慢）');
    }
    
    // 初始化文本预测器
    window.textPredictor = new TextPredictor();
    
    console.log('TensorFlow.js文本预测器已初始化');
});
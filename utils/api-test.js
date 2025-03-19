// 简单的API测试文件
const axios = require('axios');

async function testApi() {
  console.log('开始测试API连接...');
  
  try {
    // 测试基础连接
    console.log('1. 测试基础连接...');
    const baseResponse = await axios.get('http://localhost:5000/api');
    console.log('基础连接成功:', baseResponse.status);
  } catch (error) {
    console.error('基础连接错误:', error.message);
    // 继续测试其他端点
  }
  
  try {
    // 测试issues端点
    console.log('\n2. 测试issues端点...');
    const issuesResponse = await axios.get('http://localhost:5000/api/issues');
    console.log('Issues端点连接成功:', issuesResponse.status);
    console.log('返回数据样例:', issuesResponse.data.slice(0, 2));
  } catch (error) {
    console.error('Issues端点错误:', error.message);
  }
  
  try {
    // 测试POST请求
    console.log('\n3. 测试POST请求...');
    const testData = {
      title: 'API测试问题',
      description: '这是一个测试问题，用于验证API连接',
      source: 'API测试',
      issue_type: '系统功能',
      status: 'Pending'
    };
    
    console.log('发送数据:', testData);
    
    const postResponse = await axios.post(
      'http://localhost:5000/api/issues',
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('POST请求成功:', postResponse.status);
    console.log('返回数据:', postResponse.data);
  } catch (error) {
    console.error('POST请求错误:', error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
    }
  }
}

// 运行测试
testApi()
  .then(() => console.log('API测试完成'))
  .catch(err => console.error('测试过程中发生错误:', err)); 